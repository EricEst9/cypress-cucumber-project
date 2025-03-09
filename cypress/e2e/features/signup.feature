Feature: User Registration

  Scenario: Register a new user and log in
    Given the user loads the homepage
    When they register a new user
    And they close the successful registration alert
    And they log in with the new user credentials
    Then they should access the main screen with the new user
    
  Scenario: Attempt to register an existing user
    Given the user loads the homepage
    When they attempt to register an existing user