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
            withdraw: 'Withdrawing W-ETH',
            setBaseCaseFee: 'Updating case fee'
          },
          transactionErrors: {
            userRevert: 'You rejected the transaction',
            outOfGas: 'The transaction ran out of gas',
            evmRevert: 'There was an error in the contract',
            incorrectNonce: 'The nonce was incorrect (reset the account in MetaMask)',
            cancelled: 'The transaction was cancelled',
            noContractFound: 'No contract found for address, you may be on the wrong network (MainNet vs. Ropsten)',
            nonceTooLow: 'The nonce was too low (possibly need to reset the account in MetaMask)',
            exceedsBlockGasLimit: 'The transaction gasLimit exceeds block gas limit',
            replacementTransactionUnderpriced: 'The replacement transaction is underpriced (need to provide a higher gas limit)'
          },
          pageTitles: {
            welcome: 'Welcome | Hippocrates',
            loginToMetaMask: 'Login to MetaMask | Hippocrates',
            tryMetaMask: 'Try MetaMask | Hippocrates',
            emergencyKit: 'Emergency Kit | Hippocrates',
            changePassword: 'Change Password | Hippocrates',
            mint: 'Mint | Hippocrates',
            balance: 'Balance | Hippocrates',
            signIn: 'Sign In | Hippocrates',
            signUp: 'Sign Up | Hippocrates',
            diagnoseCases: 'Diagnose Cases | Hippocrates',
            diagnoseCase: 'Diagnose Case {{caseId}} | Hippocrates',
            addDoctor: 'Doctors | Hippocrates',
            newCase: 'New Case | Hippocrates',
            patientCases: 'My Cases | Hippocrates',
            patientCase: 'Case {{caseId}} | Hippocrates',
            fourOhFour: '404 | Hippocrates',
            adminFees: 'Fees | Hippocrates'
          }
        }
      }
    }
  });

export default i18next;
