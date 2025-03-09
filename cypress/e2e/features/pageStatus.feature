Feature: Page Status Verification

  Scenario: Verify HTTP status codes for all links on the homepage
    Given the user loads the homepage
    When they retrieve all links from the homepage
    Then all links should return 200 or 30x status codes
    And no link should return 40x status codes 