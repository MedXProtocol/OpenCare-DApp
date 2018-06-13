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
            addDoctor: 'Adding Doctor',
            approveAndCall: 'Sending Case Info',
            authorizeChallengeDoctor: 'Authorizing Second Opinion',
            authorizeDiagnosisDoctor: 'Authorizing Physician',
            blankState: 'Currently there are no pending transactions',
            challengeDiagnosis: 'Getting Second Opinion',
            diagnoseCase: 'Sending Diagnosis',
            diagnoseChallengedCase: 'Sending Second Opinion',
            getPublicKey: 'Getting Public Key',
            mint: 'Mint {{mintMedxCount}} MEDX',
            requestNextCase: 'Requesting Case',
            setPublicKey: 'Setting Public Key'
          },
          transactionErrors: {
            outOfGas: 'Transaction ran out of gas'
          }
        }
      }
    }
  });

export default i18next;
