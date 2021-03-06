/* Copyright (c) 2020 Red Hat, Inc. */
/* Copyright Contributors to the Open Cluster Management project */

/// <reference types="cypress" />
import { describeT } from '../support/tagging'
import { test_genericPolicyGovernance, test_applyPolicyYAML } from '../support/tests'

describeT('@extended RHACM4K-1721 - GRC UI: [P1][Sev1][console] RolePolicy governance', () => {
  test_genericPolicyGovernance('Role_policy_governance/policy-config.yaml', 'Role_policy_governance/violations-inform.yaml', 'Role_policy_governance/violations-enforce.yaml')
})

describeT('@extended GRC UI: [P1][Sev1][console] RolePolicy governance - clean up', () => {
  test_applyPolicyYAML('Role_policy_governance/role_specification_cleanup_policy_raw.yaml')
})
