# Migration `20190917122625-files`

This migration has been generated by Alex Erik at 9/17/2019, 12:26:25 PM.
You can check out the [state of the datamodel](./datamodel.prisma) after the migration.

## Database Steps

```sql

```

## Changes

```diff
diff --git datamodel.mdl datamodel.mdl
migration 20190916224253-init..20190917122625-files
--- datamodel.dml
+++ datamodel.dml
@@ -26,5 +26,13 @@
   email    String  @unique
   password String
   name     String?
   posts    Post[]
+}
+
+model File {
+  id       String @default(cuid()) @id
+  path     String
+  filename String
+  mimetype String
+  encoding String
 }
```

## Photon Usage

You can use a specific Photon built for this migration (20190917122625-files)
in your `before` or `after` migration script like this:

```ts
import Photon from '@generated/photon/20190917122625-files'

const photon = new Photon()

async function main() {
  const result = await photon.users()
  console.dir(result, { depth: null })
}

main()

```
