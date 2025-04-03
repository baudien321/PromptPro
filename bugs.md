Error: ./models/user.js:1:1
[31m[1mModule not found[22m[39m: Can't resolve '[32mmongoose[39m'
[0m[31m[1m>[22m[39m[90m 1 |[39m [36mimport[39m mongoose[33m,[39m { [33mSchema[39m[33m,[39m models } [36mfrom[39m [32m'mongoose'[39m[33m;[39m[0m
[0m [90m   |[39m [31m[1m^[22m[39m[0m
[0m [90m 2 |[39m[0m
[0m [90m 3 |[39m [90m// Define the User Schema using Mongoose[39m[0m
[0m [90m 4 |[39m [36mconst[39m [33mUserSchema[39m [33m=[39m [36mnew[39m [33mSchema[39m({[0m

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./pages/api/auth/[...nextauth].js
    at BuildError (webpack-internal:///(pages-dir-browser)/./node_modules/next/dist/client/components/react-dev-overlay/ui/container/build-error.js:43:41)
    at react-stack-bottom-frame (webpack-internal:///(pages-dir-browser)/./node_modules/react-dom/cjs/react-dom-client.development.js:22429:20)
    at renderWithHooksAgain (webpack-internal:///(pages-dir-browser)/./node_modules/react-dom/cjs/react-dom-client.development.js:5858:20)
    at renderWithHooks (webpack-internal:///(pages-dir-browser)/./node_modules/react-dom/cjs/react-dom-client.development.js:5770:22)
    at updateFunctionComponent (webpack-internal:///(pages-dir-browser)/./node_modules/react-dom/cjs/react-dom-client.development.js:8019:19)
    at beginWork (webpack-internal:///(pages-dir-browser)/./node_modules/react-dom/cjs/react-dom-client.development.js:9684:18)
    at runWithFiberInDEV (webpack-internal:///(pages-dir-browser)/./node_modules/react-dom/cjs/react-dom-client.development.js:544:16)
    at performUnitOfWork (webpack-internal:///(pages-dir-browser)/./node_modules/react-dom/cjs/react-dom-client.development.js:15045:22)
    at workLoopSync (webpack-internal:///(pages-dir-browser)/./node_modules/react-dom/cjs/react-dom-client.development.js:14871:41)
    at renderRootSync (webpack-internal:///(pages-dir-browser)/./node_modules/react-dom/cjs/react-dom-client.development.js:14851:11)
    at performWorkOnRoot (webpack-internal:///(pages-dir-browser)/./node_modules/react-dom/cjs/react-dom-client.development.js:14335:13)
    at performWorkOnRootViaSchedulerTask (webpack-internal:///(pages-dir-browser)/./node_modules/react-dom/cjs/react-dom-client.development.js:15932:7)
    at MessagePort.performWorkUntilDeadline (webpack-internal:///(pages-dir-browser)/./node_modules/scheduler/cjs/scheduler.development.js:44:48)