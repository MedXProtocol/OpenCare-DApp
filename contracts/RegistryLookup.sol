pragma solidity ^0.4.23;

import "./AccountManager.sol";
import "./AdminSettings.sol";
import "./Case.sol";
import "./CaseDiagnosingDoctor.sol";
import "./CaseManager.sol";
import "./CaseLifecycleManager.sol";
import "./CaseFirstPhaseManager.sol";
import "./CaseSecondPhaseManager.sol";
import "./CaseScheduleManager.sol";
import "./CaseStatusManager.sol";
import "./CasePaymentManager.sol";
import "./DoctorManager.sol";
import "./IEtherPriceFeed.sol";
import "./Registry.sol";
import "./WETH9.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";

library RegistryLookup {

  function accountManager(Registry self) internal view returns (AccountManager) {
    return AccountManager(self.lookup(keccak256("AccountManager")));
  }

  function caseManager(Registry self) internal view returns (CaseManager) {
    return CaseManager(self.lookup(keccak256("CaseManager")));
  }

  function caseDiagnosingDoctor(Registry self) internal view returns (CaseDiagnosingDoctor) {
    return CaseDiagnosingDoctor(self.lookup(keccak256("CaseDiagnosingDoctor")));
  }

  function caseLifecycleManager(Registry self) internal view returns (CaseLifecycleManager) {
    return CaseLifecycleManager(self.lookup(keccak256("CaseLifecycleManager")));
  }

  function caseStatusManager(Registry self) internal view returns (CaseStatusManager) {
    return CaseStatusManager(self.lookup(keccak256("CaseStatusManager")));
  }

  function caseScheduleManager(Registry self) internal view returns (CaseScheduleManager) {
    return CaseScheduleManager(self.lookup(keccak256("CaseScheduleManager")));
  }

  function caseFirstPhaseManager(Registry self) internal view returns (CaseFirstPhaseManager) {
    return CaseFirstPhaseManager(self.lookup(keccak256("CaseFirstPhaseManager")));
  }

  function caseSecondPhaseManager(Registry self) internal view returns (CaseSecondPhaseManager) {
    return CaseSecondPhaseManager(self.lookup(keccak256("CaseSecondPhaseManager")));
  }

  function casePaymentManager(Registry self) internal view returns (CasePaymentManager) {
    return CasePaymentManager(self.lookup(keccak256("CasePaymentManager")));
  }

  function doctorManager(Registry self) internal view returns (DoctorManager) {
    return DoctorManager(self.lookup(keccak256("DoctorManager")));
  }

  function dai(Registry self) internal view returns (ERC20) {
    return ERC20(self.lookup(keccak256("Dai")));
  }

  function weth9(Registry self) internal view returns (WETH9) {
    return WETH9(self.lookup(keccak256("WrappedEther")));
  }

  function etherPriceFeed(Registry self) internal view returns (IEtherPriceFeed) {
    return IEtherPriceFeed(self.lookup(keccak256("EtherPriceFeed")));
  }

  function adminSettings(Registry self) internal view returns (AdminSettings) {
    return AdminSettings(self.lookup(keccak256("AdminSettings")));
  }
}
