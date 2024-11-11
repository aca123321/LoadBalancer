const express = require('express')
const http = require('http');

const app = express()
const port = 80
const healthCheckInterval = process.argv[2] || 10; // seconds

const serverPorts = [3000, 3001, 3002, 3003];
let parity = serverPorts.length;
let ind = 0;
const deadServers = new Set();

const getJSON = (options, onResult) => {
  const port = options.port == 443 ? https : http;

  let output = '';

  const req = port.request(options, (res) => {
    console.log(`${options.host} : ${res.statusCode}`);
    res.setEncoding('utf8');
    
    res.on('data', (chunk) => {
      console.log("Received data")
      output += chunk;
    });

    res.on('end', () => {
      console.log("End of data")
      try {
        let obj = JSON.parse(output);
        onResult(res.statusCode, obj);
      } catch {
        onResult(res.statusCode, {});
      }
    });
  });

  req.on('error', (err) => {
    console.log("ERRORED OUT")
    onResult(500, {message: err.message});
  });

  req.end();
};

setInterval(() => {
  for(let i=0;i<parity;i++) {
    const options = {
      host: 'localhost',
      port: serverPorts[i],
      path: '/health-check',
      method: 'GET'
    };
    try {
      getJSON(options, (statusCode, result) => {
        if(statusCode == 200) {
          deadServers.delete(i);
        } else {
          deadServers.add(i);
        }
      });
    } catch {
      deadServers.add(i);
    }
  }
}, healthCheckInterval*1000);

const getResponseFromServer = (res, retriesLeft, errorHandler) => {
  let serverNumber = ind%parity;
  let i = 0;
  while((deadServers.has(serverNumber)) && (i<parity)) {
    ind++;
    serverNumber = ind%parity;
    i++;
  }

  console.log("RETRY NUMBER:", 3-retriesLeft)
  console.log("Requesting server :", serverPorts[serverNumber])
  const options = {
    host: 'localhost',
    port: serverPorts[serverNumber],
    path: '/',
    method: 'GET'
  };

  getJSON(options, (statusCode, result) => {
    try {
      if(statusCode != 200) {
        throw new Error("NOT OK")
      }
      console.log(`onResult: (${statusCode})\n${JSON.stringify(result)}\n`);
      res.statusCode = statusCode;
      res.send(result);
      toAttempt = false;
    }
    catch {
      errorHandler(retriesLeft, res);
    }
  });
}

app.get('/', async (req, res) => { 
  ind = (ind+1)%parity;

  const errorHandler = (retriesLeft, res) => {
    const serverNumber = ind%parity;
    deadServers.add(serverNumber);
    ind = (ind+1)%parity;
    if(retriesLeft > 0) {
      getResponseFromServer(res, retriesLeft-1, errorHandler)
    } else {
      res.send({message: 'No server available to handle this request'})
    }
  }

  getResponseFromServer(res, 3, errorHandler);
})

app.listen(port, () => {
  console.log(`Load Balancer listening on port ${port}`)
})