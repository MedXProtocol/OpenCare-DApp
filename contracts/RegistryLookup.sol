pragma solidity ^0.4.23;

import './Case.sol';
import './CaseManager.sol';
import './CaseLifecycleManager.sol';
import './CaseFirstPhaseManager.sol';
import './CaseSecondPhaseManager.sol';
import './CaseScheduleManager.sol';
import './CaseStatusManager.sol';
import './DoctorManager.sol';
import './Registry.sol';

library RegistryLookup {

  function caseManager(Registry self) internal view returns (CaseManager) {
    return CaseManager(self.lookup(keccak256("CaseManager")));
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

  function doctorManager(Registry self) internal view returns (DoctorManager) {
    return DoctorManager(self.lookup(keccak256("DoctorManager")));
  }

}
