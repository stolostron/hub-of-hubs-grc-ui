/* Copyright (c) 2020 Red Hat, Inc. */

const config = require('../../config')

module.exports = {
  elements: {
    spinner: '.content-spinner',
    searchInput: '#search',
    allTable: 'table.bx--data-table-v2.resource-table.bx--data-table-v2--zebra > tbody',
    policyLink: '.bx--data-table-v2.resource-table.bx--data-table-v2--zebra > tbody > tr:nth-child(1) > td:nth-child(2) > a',
    createPolicyButton: '#create-policy',
    overflowMenu: 'table.bx--data-table-v2.resource-table.bx--data-table-v2--zebra > tbody > tr:nth-child(1) > td > div.bx--overflow-menu',
    overflowButtonView: 'body > ul > li > button',
    sidePolicyPanel: 'div.bx--modal-container > div.bx--modal-content',
    sidePolicyPanelClose: 'div.bx--modal-container > div.bx--modal-header > button.bx--modal-close',
    submitCreatePolicyButton: '#create-button-portal-id',
    policyNameInput: '#name',
    namespaceDropdown: '.creation-view-controls-container > div > div:nth-child(2) > div.bx--list-box',
    namespaceDropdownBox: '.creation-view-controls-container > div > div:nth-child(2) > div.bx--list-box > div.bx--list-box__menu > div',
    placementRuleEdit: 'div.page-content-container div.overview-content-second > div.overview-content-second-cell:nth-child(1) button.text-edit-button',
    placementBindingEdit: 'div.page-content-container div.overview-content-second > div.overview-content-second-cell:nth-child(2) button.text-edit-button',
    yamlTab: '#yaml-tab',
    yamlEditor: '.monaco-editor',
    yamlEditButton: '#edit-button',
    yamlSubmitButton: '#submit-button'
  },
  sections: {
    overflowMenuBody: {
      selector: 'body > ul.bx--overflow-menu-options',
      elements: {
        overflowMenuView: 'li:nth-child(1) > button',
        overflowMenuEdit: 'li:nth-child(2) > button',
        overflowMenuDisable: 'li:nth-child(3) > button',
        overflowMenuEnforce: 'li:nth-child(4) > button',
        overflowMenuRemove: 'li:nth-child(5) > button'
      }
    }
  },
  commands: [{
    verifyAllPage,
    verifyCreatePage,
    verifyPolicyPage
  }]
}
/* Verify user can only see policies they should on the summary page */
function verifyAllPage(name, nsNum, permissions) {
  // Filter for our RBAC policies
  this.waitForElementVisible('@searchInput')
  this.click('@searchInput').clearValue('@searchInput').setValue('@searchInput', name)
  this.waitForElementVisible('@allTable')
  // Check that user can see expected number of policies
  this.expect.element('@allTable').to.have.property('childElementCount').equals(nsNum)
  // Check overflow menu for first policy
  this.click('@overflowMenu')
  this.expect.section('@overflowMenuBody').to.be.visible
  const overflowMenuSection = this.section.overflowMenuBody
  // All users should be able to view
  overflowMenuSection.expect.element('@overflowMenuView').to.be.enabled
  // Check for edit/disable/enforce permissions
  if (permissions.patch) {
    overflowMenuSection.expect.element('@overflowMenuEdit').to.be.enabled
    overflowMenuSection.expect.element('@overflowMenuDisable').to.be.enabled
    overflowMenuSection.expect.element('@overflowMenuEnforce').to.be.enabled
  } else {
    overflowMenuSection.expect.element('@overflowMenuEdit').to.be.not.enabled
    overflowMenuSection.expect.element('@overflowMenuDisable').to.be.not.enabled
    overflowMenuSection.expect.element('@overflowMenuEnforce').to.be.not.enabled
  }
  // Check for remove permissions
  if (permissions.delete) {
    overflowMenuSection.expect.element('@overflowMenuRemove').to.be.enabled
  } else {
    overflowMenuSection.expect.element('@overflowMenuRemove').to.be.not.enabled
  }
  // Make sure side panel can open
  overflowMenuSection.click('@overflowMenuView')
  this.expect.element('@sidePolicyPanel').to.be.visible
  this.waitForElementNotPresent('@spinner')
  this.click('@sidePolicyPanelClose')
  this.waitForElementNotPresent('@sidePolicyPanel')
}

function verifyPolicyPage(name, permissions) {
  // Filter for our RBAC policies
  this.waitForElementVisible('@searchInput')
  this.click('@searchInput').clearValue('@searchInput').setValue('@searchInput', name)
  this.waitForElementVisible('@allTable')
  // Navigate to policy page
  this.expect.element('@policyLink').text.to.startWith(name)
  this.click('@policyLink')
  this.waitForElementNotPresent('@spinner')
  this.waitForElementPresent('@placementBindingEdit')
  if (permissions.patch) {
    this.expect.element('@placementBindingEdit').to.be.enabled
    this.expect.element('@placementRuleEdit').to.be.enabled
  } else {
    this.expect.element('@placementBindingEdit').to.not.be.enabled
    this.expect.element('@placementRuleEdit').to.not.be.enabled
  }
  // Check YAML tab
  this.click('@yamlTab')
  this.waitForElementPresent('@yamlEditor')
  if (permissions.patch) {
    this.expect.element('@yamlEditButton').to.be.enabled
    this.expect.element('@yamlSubmitButton').to.be.enabled
  } else {
    this.expect.element('@yamlEditButton').to.be.not.enabled
    this.expect.element('@yamlSubmitButton').to.be.not.enabled
  }
}

function verifyCreatePage(permissions, createPage, policyName = '', ns = [], clusterwide = false, elevated = false) {
  // Check Create Policy button
  // If a user has multiple permissions for different namespaces, the create
  // button may be enabled, which is the purpose of setting `elevated`
  if (permissions.create || elevated) {
    this.expect.element('@createPolicyButton').to.be.enabled
    if (permissions.create) {
      // Go to Create policy page
      this.click('@createPolicyButton')
      this.waitForElementNotPresent('@spinner')
      // Check available namespaces
      this.click('@namespaceDropdown')
      this.waitForElementVisible('@namespaceDropdownBox')
      ns.forEach((namespace) => {
        this.api.elements('xpath', `//div[contains(@class,"bx--list-box__menu-item") and text()="${namespace}"]`, (result) => {
          this.assert.equal(result.value.length, 1, `User should be able to see namespace ${namespace}`)
        })
      })
      // If user has clusterwide permissions, they should see more namespaces
      // Otherwise, they should only see the namespaces specified
      if (clusterwide) {
        this.api.elements('@namespaceDropdownBox', (result) => {
          this.assert.ok(result.value.length > ns.length, 'User should be able to see namespaces clusterwide.')
        })
      } else {
        this.api.elements('@namespaceDropdownBox', (result) => {
          this.assert.ok(result.value.length, ns.length, `User should only be able to see namespaces: ${ns}`)
        })
      }
      this.click('@namespaceDropdown')
      this.waitForElementNotPresent('@namespaceDropdownBox')
      // Create policy
      createPage.createTestPolicy(true, { policyName: policyName, namespace: ns[0] })
    }
  } else {
    this.expect.element('@createPolicyButton').to.not.be.enabled

    // Make sure users can't navigate to the Create page directly
    this.api.url(`${this.api.launchUrl}${config.get('contextPath')}/create`)
    this.waitForElementNotPresent('@spinner')
    this.expect.element('@submitCreatePolicyButton').to.not.be.present
    this.expect.element('@createPolicyButton').to.be.present
  }
}