import sys
import os
import json
from watson_developer_cloud import DiscoveryV1

discovery = DiscoveryV1(
  username="01fc7bcc-959e-492f-8986-f8006116f014",
  password="teHIHEaUfAAR",
  version="2016-12-01"
)

with open(os.path.join(os.getcwd(), 'my_config.json')) as config_data:
  data = json.load(config_data)
  updated_config = discovery.update_configuration('c1cebfb0-0cc5-4c4b-b4e3-76733852e736', 'be94907f-e7cc-4915-95f5-84dcc23ae5e7', data)
print(json.dumps(updated_config, indent=2))
