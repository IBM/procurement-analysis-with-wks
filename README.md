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

