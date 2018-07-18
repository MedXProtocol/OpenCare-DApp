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
            acceptDiagnosis: 'Accept Diagnosis',
            addOrReactivateDoctor: 'Adding / Reactivating Doctor',
            deactivateDoctor: 'Deactivating Doctor',
            approveAndCall: 'Sending Case Info',
            setChallengingDoctor: 'Authorizing Second Opinion',
            setDiagnosingDoctor: 'Authorizing Physician',
            blankState: 'Currently there are no pending transactions',
            challengeWithDoctor: 'Getting Second Opinion',
            diagnoseCase: 'Sending Diagnosis',
            diagnoseChallengedCase: 'Sending Second Opinion',
            publicKeys: 'Retrieving Account',
            mint: 'Mint {{mintMedxCount}} MEDX',
            requestNextCase: 'Requesting Case',
            setPublicKey: 'Registering Account',
            sendMedX: 'Sending {{mintMedxCount}} MEDX',
            sendEther: 'Sending 1 ETH',
            addDoctor: 'Upgrading to Doctor'
          },
          transactionErrors: {
            userRevert: 'You rejected the transaction, please submit a valid transaction to proceed',
            outOfGas: 'The transaction ran out of gas',
            evmRevert: 'There was an error in the contract',
            incorrectNonce: 'The nonce was incorrect (reset the account in MetaMask)'
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
            fourOhFour: '404 | Hippocrates'
          }
        }
      }
    }
  });

export default i18next;
