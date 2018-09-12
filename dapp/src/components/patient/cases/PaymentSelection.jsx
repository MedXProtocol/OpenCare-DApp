// import React, { Component } from 'react'
// import { connect } from 'react-redux'
// import { cold } from 'react-hot-loader';
// import { Button, Modal } from 'react-bootstrap'
// import { toastr } from '~/toastr'
// import ReactTooltip from 'react-tooltip'
// import { withRouter } from 'react-router-dom'
// import classnames from 'classnames'
// import { isTrue } from '~/utils/isTrue'
// import { sleep } from '~/utils/sleep'
// import { isNotEmptyString } from '~/utils/isNotEmptyString'
// import { cancelablePromise } from '~/utils/cancelablePromise'
// import { uploadJson, uploadFile } from '~/utils/storage-util'
// import hashToHex from '~/utils/hash-to-hex'
// import get from 'lodash.get'
// import { genKey } from '~/services/gen-key'
// import { currentAccount } from '~/services/sign-in'
// import { jicImageCompressor } from '~/services/jicImageCompressor'
// import { computeChallengeFee } from '~/utils/computeChallengeFee'
// import { computeTotalFee } from '~/utils/computeTotalFee'
// import { EtherFlip } from '~/components/EtherFlip'
// import { Dai } from '~/components/Dai'
// import { DaiBalance } from '~/components/DaiBalance'
// import { DaiApproval } from '~/components/DaiApproval'
// import { InfoQuestionMark } from '~/components/InfoQuestionMark'
// import { ControlLabel, ToggleButtonGroup, ToggleButton, ButtonToolbar } from 'react-bootstrap'
// import {
//   contractByName,
//   withContractRegistry,
//   cacheCall,
//   cacheCallValue,
//   withSaga,
//   withSend,
//   TransactionStateHandler
// } from '~/saga-genesis'
// import { DoctorSelect } from '~/components/DoctorSelect'
// import { reencryptCaseKeyAsync } from '~/services/reencryptCaseKey'
// import { getExifOrientation } from '~/services/getExifOrientation'
// import { mixpanel } from '~/mixpanel'
// import { Loading } from '~/components/Loading'
// import { HippoImageInput } from '~/components/forms/HippoImageInput'
// import { HippoTextArea } from '~/components/forms/HippoTextArea'
// import { PatientInfo } from './PatientInfo'
// import { SpotQuestions } from './SpotQuestions'
// import { RashQuestions } from './RashQuestions'
// import { AcneQuestions } from './AcneQuestions'
// import { AvailableDoctorSelect } from '~/components/AvailableDoctorSelect'
// import pull from 'lodash.pull'
// import FlipMove from 'react-flip-move'
// import { promisify } from '~/utils/promisify'
// import { regions } from '~/lib/regions'
//
// function mapStateToProps (state) {
//   const address = get(state, 'sagaGenesis.accounts[0]')
//   const CasePaymentManager = contractByName(state, 'CasePaymentManager')
//   const Dai = contractByName(state, 'Dai')
//   const WrappedEther = contractByName(state, 'WrappedEther')
//
//   const balance = get(state, 'sagaGenesis.ethBalance.balance')
//   const caseFeeEtherWei = cacheCallValue(state, CasePaymentManager, 'caseFeeEtherWei')
//   const caseFeeUsdWei = cacheCallValue(state, CasePaymentManager, 'baseCaseFeeUsdWei')
//   const usdPerWei = cacheCallValue(state, CasePaymentManager, 'usdPerEther')
//
//   return {
//     address,
//     caseFeeEtherWei,
//     caseFeeUsdWei,
//     usdPerWei,
//     CasePaymentManager,
//     balance,
//     WrappedEther,
//     Dai
//   }
// }
//
// function* saga({ address, AccountManager, CaseManager, CasePaymentManager }) {
//   if (!address || !AccountManager || !CaseManager) { return }
//   yield cacheCall(CasePaymentManager, 'caseFeeEtherWei')
//   yield cacheCall(CasePaymentManager, 'usdPerEther')
//   yield cacheCall(CasePaymentManager, 'baseCaseFeeUsdWei')
// }
//
// export const PaymentSelection = connect(mapStateToProps)(
//   withSaga(paymentSelectionSaga)(
//     class _PaymentSelect extends PureComponent {
//       static propTypes = {
//         paymentMethod: PropTypes.string.isRequired,
//         onChangePaymentMethod:
//       }
//
//       render () {
//
//         if (this.props.paymentMethod === 'ETH') {
//           var caseFeeItem = <EtherFlip wei={computeTotalFee(this.props.caseFeeEtherWei) - computeChallengeFee(this.props.caseFeeEtherWei)} />
//           var depositItem = <EtherFlip wei={computeChallengeFee(this.props.caseFeeEtherWei)} />
//           var totalItem = <EtherFlip wei={computeTotalFee(this.props.caseFeeEtherWei)} />
//         } else {
//           var daiBalanceRow =
//             <tr>
//               <th>Your DAI balance:</th>
//               <td><DaiBalance address={this.props.address} /></td>
//             </tr>
//           var daiApprovalRow =
//             <tr>
//               <th>
//                 Approved DAI: &nbsp;
//                 <InfoQuestionMark
//                   name="approval-info"
//                   place="bottom"
//                   tooltipText="You need to first approve of us spending Dai on your behalf"
//                 />
//               </th>
//               <td>
//                 <DaiApproval address={this.props.address} requiredWei={computeTotalFee(this.props.caseFeeUsdWei)} />
//               </td>
//             </tr>
//           caseFeeItem = <Dai wei={computeTotalFee(this.props.caseFeeUsdWei) - computeChallengeFee(this.props.caseFeeUsdWei)} />
//           depositItem = <Dai wei={computeChallengeFee(this.props.caseFeeUsdWei)} />
//           totalItem = <Dai wei={computeTotalFee(this.props.caseFeeUsdWei)} />
//         }
//
//         return (
//           <div>
//             <div>
//               <ControlLabel>Payment Method</ControlLabel>
//               <ButtonToolbar>
//                 <ToggleButtonGroup
//                   name='Payment Method'
//                   type="radio"
//                   value={this.props.paymentMethod}
//                   onChange={(value) => this.setState({paymentMethod: value})}>
//                   {
//                     ['ETH', 'DAI'].map((option) => {
//                       return <ToggleButton
//                               key={`payment-method-${option}`}
//                               value={option}>
//                               {option}
//                             </ToggleButton>
//                     })
//                   }
//                 </ToggleButtonGroup>
//               </ButtonToolbar>
//             </div>
//             <table className="table table--invoice">
//               <tbody>
//                 <tr>
//                   <th>
//                     Fee:
//                   </th>
//                   <td>
//                     {caseFeeItem}
//                   </td>
//                 </tr>
//                 <tr>
//                   <th>
//                     Deposit for Second Opinion:
//                     &nbsp;<InfoQuestionMark
//                       name="deposit-info"
//                       place="bottom"
//                       tooltipText="If you do not require a second opinion <br />this deposit will be refunded."
//                     />
//                   </th>
//                   <td>
//                     {depositItem}
//                   </td>
//                 </tr>
//                 <tr>
//                   <th>
//                     Total:
//                   </th>
//                   <td>
//                     {totalItem}
//                   </td>
//                 </tr>
//                 {daiBalanceRow}
//                 {daiApprovalRow}
//               </tbody>
//             </table>
//           </div>
//         )
//       }
//     }
//   )
// )
