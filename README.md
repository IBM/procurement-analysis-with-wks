<<<<<<< Updated upstream
# Procurement System



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

=======

WKS-Discovery-BM Graph
In this journey, we will be creating complete end to end AI solution for procurement use case.

The steps followed to create solution is as follows.

WKS
1. We build Type System specific to business domain/use case
2. We follow human annotation process to identify entities and relationship.
3. We create machine learning model and train the model till we are satisfied with model.
4. The corpus document from document is exported which will be used by Discovery Service.

Discovery Service
5. We create discovery service from bluemix account and import the corpus documents exported from step 4.

IBM Graph
6. We create graph for this use case by creating schema/initial data for bootstrapping graph.

Client Application
7. We create client application which calls Discovery Service
8. The output (json data) of discovery service is parsed and nodes and edges for the graph are created dynamically. 


Process Flow




 





































                                                                                        

                                                                             






Technical Architecture

                       					     











Features
1. User can query to know suppliers for a commodity
2. User can get info along with supplier and their facility available
3. User can query to get any supplier constraints
4. User can query supply status based on country/region.
Included Components
a. Watson Knowledge Studio
b. Bluemix Watson Discovery Service
c. Client Application
d. IBM Graph
Deploy the Machine learning model to Discovery
 




>>>>>>> Stashed changes