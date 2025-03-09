Feature: Categories and Product Navigation

  Scenario: User navigates through the Phones category
    Given the user loads the homepage
    When they click on the "Phones" category
    Then they should see only products from the "Phones" category
    And they should not see products from other categories

  Scenario: User navigates through the Laptops category
    Given the user loads the homepage
    When they click on the "Laptops" category
    Then they should see only products from the "Laptops" category
    And they should not see products from other categories

  Scenario: User navigates through the Monitors category
    Given the user loads the homepage
    When they click on the "Monitors" category
    Then they should see only products from the "Monitors" category
    And they should not see products from other categories
    
  Scenario: Photo carousel works correctly
    Given the user loads the homepage
    Then they should see the photo carousel
    When they click on the "Next" button of the carousel
    Then they should see the next image in the carousel
    When they click on the "Previous" button of the carousel
    Then they should see the previous image in the carousel 