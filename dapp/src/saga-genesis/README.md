# Introduction

This module separates asynchronous calls from your components using sagas.  When certain properties on a
component change, the saga is run.  

This module offers additional sagas and reducers to provide Web3 caching functionality.

# Project Ideals

1. Only Plain Old JavaScript Objects live in the state.  Web3 contracts should not live in the state.

# TODO

- [x] fix caching
- [ ] Put contract registry into the state with sagas.  The contract registry needs to store the contract ABI.
- [ ] Create contract accessor like cacheCallValue and move all of them into a 'finders' module
