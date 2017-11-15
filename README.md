# MedCredits Smart Contracts

[![Logo](assets/medcredwhitecropped.png)](https://medcredits.io/)

Smart contracts used by MedCredits

### Install
    $ npm install

### Testing

See [testrpc github](https://github.com/ethereumjs/testrpc) for instruction on how to install `testrpc`. 

Start `testrpc` with default accounts 

    $ testrpc
    
or for accounts with more ether

    $ testrpc --account="0xa4ac238ec192b49d3e31666a9df4810737f0700e6c46f4a306ac1ac0bb1b39df,6000000000000000000000" --account="0xb1f642d0a7cff59249aa2a95cbb71ab2418a39a9c7f986e0265fea16047b05d7,6000000000000000000000" --account="0x3f8af19ea0cb43e185dca47ce06b7ca20ec4cb2e469d001c7809cd2bb73efab4,6000000000000000000000" --account="0x4d0b3d9eecfa95dab1245be5730d715f17cf8fa820ae05405bce2bb8eeb0e74a,6000000000000000000000" --account="0x6b8a7ca98e5235ab31fdf69eee4ff2deebd076c37ee7f39b70020d5a1298ee6e,11000000000000000000000" --account="0xdfd5067350112a9f94f6869c7b2ce8fff55b6cf264eb5a102b3c5d385a54a501,6000000000000000000000" --account="0x19ef703b86bd24bfea046dfb116e3668caf73961a568dad5f8e8916a1620017e,6000000000000000000000" --account="0x53c28f72bbadb579e9ae90789fe70f8b05d0b608457bd56d0ba49f4a188de94b,6000000000000000000000" --account="0x9dd4f1d2cdaa0f63160649d2b54232ff1ba2d1da2a3af33689c468ed66b6ad15,6000000000000000000000" --account="0x1e1fc8869bded138cb1d001de246ae4ff4f734601f9c3b00b398b44c14a4214c,6000000000000000000000" 

then

    $ truffle test
