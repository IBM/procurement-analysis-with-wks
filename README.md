![Build Status](https://travis-ci.org/rameshpoomalai/ProcurementSystem.svg?branch=master)
![Bluemix Deployments](https://deployment-tracker.mybluemix.net/stats/4b751f79e33f1202fce05f6ba8c0e740/badge.svg)

Watson Knowledge Studio-Discovery-BM Graph
In this journey, we will be creating complete end to end solution for procurement use case.

Currently customers do analysis of various market reports on their own or hire experts to make procurement decision. The expert analyze the reports captured from various data source. This can be time consuming and creates dependency on experts, every time a procurement decision has to be made. There is also probability of human error if expert misses important factor.
e.g. Assume experts have to analyze various report, different suppliers and their location.If he/she missed to consider some of these factor like plant shutdown and he/she might request a material from the supplier. Now this supplier who has plant down may not able serve the order immediately and that might impact production.
By using our intelligent procurement system customer can get such expert analysis faster and more accurate. The customer has to initially train the model/system with various use cases(reports).
The target end user of this system is person who is working for a procurement section in a company or any other stakeholder who has authority to make procurement decisions.

To understand the significance of wks we will look into details of few entities extracted by discovery without wks model and with wks model.

Discovery output without wks
	......
	"text": "Asahi Kasei Corp",
	"relevance": 0.227493,
	"type": "Company"
	.......

	"text": "Kawasaki",
	"relevance": 0.274707,
	"type": "Company"
	.......

Discovery output with wks
	.......
	"id": "-E114",
	"text": "Asahi Kasei Corp",
	"type": "Supplier""
	.......

	"id": "-E119",
	"text": "Kawasaki",
	"type": "Facility"
	.......

  In case of discovery without wks, Asahi Kasei is identified as company as expected from basic nlu processing. It cannot understand procurement domain specific nomenclature. The same is the case with capturing plant name Kawasaki. It identifies Kawasaki as company instead of facility.
  But in discovery with wks, it identifies Asahi Kasei as supplier and Kawasaki as facility(plant).

The steps followed to create solution is as follows. For commands please refer Running the application on Bluemix section below.

## Watson Knowledge Studio (WKS)
1. We build Type System specific to business domain/use case
2. We follow human annotation process to identify entities and relationship.
3. We create machine learning model and train the model till we are satisfied with model.
4. The corpus document from document tab can be exported which can be imported into new wks project if required.

## Discovery Service
1. We create discovery service from bluemix account. The discovery has to be created under US South as services under US South are ONLY visible while deploying wks model into discovery.
2. We create collection with customized configuration which points to wks model id.

## IBM Graph
1. We create graph for this use case by creating schema/initial data for bootstrapping graph.

## Client Application
1. We create client application which calls Discovery Service
2. The output (json data) of discovery service is parsed and nodes and edges for the graph are created dynamically.


## Process Flow

<img src="images/Process flow for wks-discovery-graph.png" width="800" height="350" align="center">

## Technical Architecture

<img src="images/Technical Architecture.png" width="800" height="350" align="center">

<img src="images/Technical Architecture - 2.png" width="800" height="350" align="center">


## Features
1. User can query to know suppliers for a commodity
2. User can get info along with supplier and their facility available
3. User can query to get any supplier constraints
4. User can query supply status based on country/region.
Included Components
a. Watson Knowledge Studio
b. Bluemix Watson Discovery Service
c. Client Application
d. IBM Graph

## Deploy the Machine learning model to Discovery
<img src="images/Deploy wks model to discovery 1.png" width="800" height="350" align="center">

<img src="images/Deploy wks model to discovery 2.png" width="800" height="350" align="center">




## Running the application on Bluemix or other Cloud Foundry platforms

1. If you do not already have access to a Cloud Foundry PaaS, [sign up for Bluemix](https://console.ng.bluemix.net/registration/).

2. Download and install the [Cloud Foundry CLI](https://github.com/cloudfoundry/cli).

3. Clone the app to your local environment from your terminal using the following command:

    git clone https://github.ibm.com/IBMDigital/Procurement-System.git

4. Change into the newly created directory:


    cd ProcurementSystem


5. Open the `manifest.yml` file and change the `host` value to something unique.

   The host you choose will determine the subdomain of your application's URL.

6. Connect to Bluemix in the command line tool and log in.


    cf api <API_URL> # e.g. https://api.ng.bluemix.net
    cf login


7. Create an instance of the IBM Graph service.


    cf create-service "IBM Graph" Standard ProcurementSystemGraph

    cf create-service-key ProcurementSystemGraph ProcurementSystemGraph

8. Create an instance of the Discovery Service.


    cf create-service discovery standard ProcurementSystemDiscovery
    cf create-service-key ProcurementSystemDiscovery ProcurementSystemDiscoveryServiceKey
    cf service-key ProcurementSystemDiscovery ProcurementSystemDiscoveryServiceKey

9. Push the app.


# optionally, log in
    cf api <API_URL> # e.g. https://api.ng.bluemix.net
    cf login
# deploy the app
  cf push




## Deploy the App

  a. Click on the 'Deploy to Bluemix' button below.
   [![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.ibm.com/IBMDigital/Procurement-System)
