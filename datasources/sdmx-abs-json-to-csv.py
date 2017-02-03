import json5, csv

def findkeyof3(totalvalueids):
    for key in totalValueIds:
        if totalValueIds[key]==['3']:
            return key

def findKeyOfAge(totalValueIds):
    for key in totalValueIds:
        if 'O15' in totalValueIds[key] or 'TT' in totalValueIds[key]:
            return key

def getLastIndex(s1, s2):
    return -s1[::-1].index(s2)

with open('node_modules/TerriaJS/build/wwwroot/test/init/sdmx-abs.json') as data_file:
    data = json5.load(data_file)

s = [(x['name'], # group
      y['name'][:getLastIndex(y['name'], '(')-2], # name
      y['name'][getLastIndex(y['name'], '('):-1], # id
      '(LGA)' in y['name'], # isLGA
      'STATE' in y.get('aggregatedDimensionIds', []), # hasState
      y.get('singleValuedDimensionIds'), # singleValuedDimensionIds
      findKeyOf3(y.get('totalValueIds', {})), # sexId
      findKeyOfAge(y.get('totalValueIds', {})), # ageId
      y.get('regionDimensionId'), # regionDimensionId
     ) for x in data['catalog'][0]['items'] for y in x['items']]

with open('datasources/sdmx-abs.csv', 'w') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(('group', 'name', 'id', 'isLGA', 'hasState', 'singleValuedDimensionIds', 'sexId', 'ageId', 'regionDimensionId'))
    for row in s:
        writer.writerow(row)


