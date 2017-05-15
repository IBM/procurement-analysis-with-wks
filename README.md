[![Build Status](https://travis-ci.org/IBM/watson-online-store.svg?branch=master)](https://travis-ci.org/IBM/Procurement-System)
![Bluemix Deployments](https://deployment-tracker.mybluemix.net/stats/5fd641e32af04e4adb16f26c46de3587/badge.svg)

Watson Knowledge Studio-Discovery-BM Graph
In this journey, we will be creating complete end to end AI solution for procurement use case.

The steps followed to create solution is as follows. For commands please refer Running the application on Bluemix section below.

##Watson Knowledge Studio (WKS)
1. We build Type System specific to business domain/use case
2. We follow human annotation process to identify entities and relationship.
3. We create machine learning model and train the model till we are satisfied with model.
4. The corpus document from document tab can be exported which can be imported into new wks project if required.

##Discovery Service
1. We create discovery service from bluemix account.
2. We create collection with customized configuration which points to wks model id.

##IBM Graph
1. We create graph for this use case by creating schema/initial data for bootstrapping graph.

##Client Application
1. We create client application which calls Discovery Service
2. The output (json data) of discovery service is parsed and nodes and edges for the graph are created dynamically.


##Process Flow

<img src="images/Process flow for wks-discovery-graph.png" width="800" height="350" align="center">

##Technical Architecture

<img src="images/Technical Architecture.png" width="800" height="350" align="center">

<img src="images/Technical Architecture - 2.png" width="800" height="350" align="center">


##Features
1. User can query to know suppliers for a commodity
2. User can get info along with supplier and their facility available
3. User can query to get any supplier constraints
4. User can query supply status based on country/region.
Included Components
a. Watson Knowledge Studio
b. Bluemix Watson Discovery Service
c. Client Application
d. IBM Graph

##Deploy the Machine learning model to Discovery
<img src="images/Deploy wks model to discovery 1.png" width="800" height="350" align="center">

<img src="images/Deploy wks model to discovery 2.png" width="800" height="350" align="center">




## Running the application on Bluemix or other Cloud Foundry platforms

1. If you do not already have access to a Cloud Foundry PaaS, [sign up for Bluemix](https://console.ng.bluemix.net/registration/).

2. Download and install the [Cloud Foundry CLI](https://github.com/cloudfoundry/cli).

3. Clone the app to your local environment from your terminal using the following command:

   ```
git clone https://github.com/rameshpoomalai/ProcurementSystem.git
   ```

4. Change into the newly created directory:

   ```
cd ProcurementSystem
   ```

5. Open the `manifest.yml` file and change the `host` value to something unique.

   The host you choose will determine the subdomain of your application's URL.

6. Connect to Bluemix in the command line tool and log in.

   ```
cf api <API_URL> # e.g. https://api.ng.bluemix.net
cf login
   ```

7. Create an instance of the IBM Graph service.

   ```
cf create-service "IBM Graph" Standard ProcurementSystemGraph

cf create-service-key ProcurementSystemGraph ProcurementSystemGraph
   ```
8. Create an instance of the Discovery Service.

  ```
cf create-service "Discovery" Free ProcurementSystemDiscovery
  ```
9. Push the app.

  ```
# optionally, log in
cf api <API_URL> # e.g. https://api.ng.bluemix.net
cf login
# deploy the app
cf push

  ```

  ## Deploy the App
  <b>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[Lab Document Download](http://ibm.biz/Bdru7G)</b>

  a. Click on the 'Deploy to Bluemix' button below.

  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.ibm.com/IBMDigital/Procurement-System)
