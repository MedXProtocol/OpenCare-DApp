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
            blankState: 'Currently there are no pending transactions',
            mint: 'Mint {{mintMedxCount}} MEDX',
            approveAndCall: 'Submit New Case'
          }
        }
      }
    }
  });

export default i18next;
