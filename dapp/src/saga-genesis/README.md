# Introduction

This module separates asynchronous calls from your components using sagas.  Within those sagas, a web3 cache


offers asynchronous web3 calling and caching.

# TODO

- [ ] fix caching
- [ ] Put contract registry into the state with sagas.  There should be a contract factory that can create
contracts by name and optionally address.
- [ ] Create contract accessor like cacheCallValue and move all of them into a 'finders' module
