import i18next from 'i18next';

i18next
  .init({
    interpolation: {
      escapeValue: false
    },
    lng: 'en',
    ns: 'translation',
    resources: {
      en: {
        translation: {
          transactions: {
            acceptDiagnosis: 'Accepting Diagnosis',
            acceptAsDoctor: 'Accepting Diagnosis',
            acceptAllAsDoctor: 'Closing Multiple Cases',
            addDoctor: 'Upgrading to Doctor',
            addOrReactivateDoctor: 'Adding / Reactivating Doctor',
            deactivateDoctor: 'Deactivating Doctor',
            createAndAssignCaseWithPublicKey: 'Sending Case Info',
            createAndAssignCase: 'Sending Case Info',
            blankState: 'Currently there are no pending transactions',
            challengeWithDoctor: 'Getting Second Opinion',
            diagnoseCase: 'Sending Diagnosis',
            diagnoseChallengedCase: 'Sending Diagnosis', // don't let the 2nd doctor know it's a second opinion
            publicKeys: 'Retrieving Account',
            mint: 'Mint {{mintMedxCount}} MEDT (Test MEDX)',
            patientWithdrawFunds: 'Withdrawing Funds',
            patientRequestNewInitialDoctor: 'Requesting New Doctor',
            patientRequestNewChallengeDoctor: 'Requesting New Doctor',
            setPublicKey: 'Registering Account',
            sendMedX: 'Sending {{mintMedxCount}} MEDT (Test MEDX)',
            sendEther: 'Sending 1 ETH',
            sendDai: 'Sending 1000 DAI',
            withdraw: 'Withdrawing W-ETH',
            setBaseCaseFeeUsdWei: 'Updating case fee',
            approve: 'Approving DAI Spend'
          },
          transactionErrors: {
            userRevert: 'You rejected the transaction.',
            outOfGas: 'The transaction ran out of gas.',
            evmRevert: 'There was an error in the contract.',
            incorrectNonce: 'The nonce was incorrect (reset the account in MetaMask).',
            cancelled: 'The transaction was cancelled.',
            noContractFound: 'No contract found for address, you may be on the wrong network (MainNet vs. Ropsten).',
            nonceTooLow: 'The nonce was too low (possibly need to reset the account in MetaMask).',
            exceedsBlockGasLimit: 'The transaction gasLimit exceeds block gas limit.',
            replacementTransactionUnderpriced: 'The replacement transaction is underpriced (need to provide a higher gas limit).'
          },
          pageTitles: {
            welcome: 'Welcome | OpenCare - Powered by MedX Protocol',
            loginToMetaMask: 'Login to MetaMask | OpenCare - Powered by MedX Protocol',
            tryMetaMask: 'Try MetaMask | OpenCare - Powered by MedX Protocol',
            emergencyKit: 'Emergency Kit | OpenCare - Powered by MedX Protocol',
            changePassword: 'Change Password | OpenCare - Powered by MedX Protocol',
            mint: 'Mint | OpenCare - Powered by MedX Protocol',
            balance: 'Balance | OpenCare - Powered by MedX Protocol',
            signIn: 'Sign In | OpenCare - Powered by MedX Protocol',
            signUp: 'Sign Up | OpenCare - Powered by MedX Protocol',
            diagnoseCases: 'Diagnose Cases | OpenCare - Powered by MedX Protocol',
            diagnoseCase: 'Diagnose Case {{caseId}} | OpenCare - Powered by MedX Protocol',
            addDoctor: 'Doctors | OpenCare - Powered by MedX Protocol',
            newCase: 'New Case | OpenCare - Powered by MedX Protocol',
            patientCases: 'My Cases | OpenCare - Powered by MedX Protocol',
            patientCase: 'Case {{caseId}} | OpenCare - Powered by MedX Protocol',
            fourOhFour: '404 | OpenCare - Powered by MedX Protocol',
            adminSettings: 'Settings | OpenCare - Powered by MedX Protocol',
            adminFees: 'Fees | OpenCare - Powered by MedX Protocol',
            updateAdminSettings: 'Updating Admin Settings'
          }
        }
      }
    }
  });

export default i18next;
