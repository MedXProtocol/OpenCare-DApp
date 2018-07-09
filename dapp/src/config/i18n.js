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
            challengeDiagnosis: 'Getting Second Opinion',
            diagnoseCase: 'Sending Diagnosis',
            diagnoseChallengedCase: 'Sending Second Opinion',
            publicKeys: 'Retrieving Account',
            mint: 'Mint {{mintMedxCount}} MEDX',
            requestNextCase: 'Requesting Case',
            setPublicKey: 'Registering Account'
          },
          transactionErrors: {
            userRevert: 'You rejected the transaction, please submit a valid transaction to proceed',
            outOfGas: 'The transaction ran out of gas',
            evmRevert: 'There was an error in the contract'
          }
        }
      }
    }
  });

export default i18next;
