import json

with open('npc_configs.json') as f:
  data = json.load(f)

n = {}

i = 0

while i < len(data):
    print(data[i]['id'])
    if 'name' in data[i]:
        if n.get(data[i]['name']):
            n[data[i]['name']] = n[data[i]['name']] + "," + data[i]['id']
        else:
            n[data[i]['name']] = data[i]['id']
    i += 1

with open("sample.json", "w") as outfile:
    json.dump(n, outfile)