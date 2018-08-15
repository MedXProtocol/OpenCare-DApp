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
            acceptAsDoctorAfterADay: 'Accepting Diagnosis',
            addOrReactivateDoctor: 'Adding / Reactivating Doctor',
            deactivateDoctor: 'Deactivating Doctor',
            approveAndCall: 'Sending Case Info',
            blankState: 'Currently there are no pending transactions',
            challengeWithDoctor: 'Getting Second Opinion',
            diagnoseCase: 'Sending Diagnosis',
            diagnoseChallengedCase: 'Sending Diagnosis', // don't let the 2nd doctor know it's a second opinion
            publicKeys: 'Retrieving Account',
            mint: 'Mint {{mintMedxCount}} MEDT (Test MEDX)',
            setPublicKey: 'Registering Account',
            sendMedX: 'Sending {{mintMedxCount}} MEDT (Test MEDX)',
            sendEther: 'Sending 1 ETH',
            addDoctor: 'Upgrading to Doctor'
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
            welcome: 'Welcome | DermX',
            loginToMetaMask: 'Login to MetaMask | DermX',
            tryMetaMask: 'Try MetaMask | DermX',
            emergencyKit: 'Emergency Kit | DermX',
            changePassword: 'Change Password | DermX',
            mint: 'Mint | DermX',
            balance: 'Balance | DermX',
            signIn: 'Sign In | DermX',
            signUp: 'Sign Up | DermX',
            diagnoseCases: 'Diagnose Cases | DermX',
            diagnoseCase: 'Diagnose Case {{caseId}} | DermX',
            addDoctor: 'Doctors | DermX',
            newCase: 'New Case | DermX',
            patientCases: 'My Cases | DermX',
            patientCase: 'Case {{caseId}} | DermX',
            fourOhFour: '404 | DermX'
          }
        }
      }
    }
  });

export default i18next;
