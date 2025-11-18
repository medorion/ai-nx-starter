### App -> Solution

```mongo
db.apps.aggregate([
  { $match: {} },       // match all documents
  { $out: "solutions" }  // output to new collection
]);
```

Migrate defaultConfiguration to defaultCommunicationSettings

```mongo
db.apps.aggregate([
  { $match: {} },       // match all documents
  { $out: "solutions" }  // output to new collection
]);
```
