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
1) Create a `url.txt` file that contains the following (duplicate the content as many times as you want, I tested it with 15360 such lines):
```
url = "http://localhost"
url = "http://localhost"
url = "http://localhost"
url = "http://localhost"
url = "http://localhost"
url = "http://localhost"
url = "http://localhost"
url = "http://localhost"
url = "http://localhost"
url = "http://localhost"
```
2) `(curl --parallel --parallel-immediate --parallel-max 12 --config urls.txt) > out.txt`
3) Use an editor to find the number of occurrences of each port. Should roughly be a fourth of the number of lines in urls.txt


Try stopping and restarting the backend servers too
