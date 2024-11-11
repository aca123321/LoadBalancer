# LoadBalancer

Basic HTTP Load Balancer (w/o Keep-alive connections for now)

Steps:
```
npm install
cd server
npm install
node be.js 3000
node be.js 3001
node be.js 3002 
node be.js 3003 
cd ..
node lb.js 10
```

Load balancer should be available on `http://localhost/` (port 80, http)

Could use the following to test the load balancer:

`(curl --parallel --parallel-immediate --parallel-max 12 --config urls.txt) > out.txt`

Try stopping and restarting the backend servers too
