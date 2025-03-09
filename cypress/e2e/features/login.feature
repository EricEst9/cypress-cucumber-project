Feature: Login

  Scenario: User attempts to login with a non-existent username
    Given the user loads the homepage
    When they enter a username that does not exist
    Then they should see a message indicating the user does not exist
    And the HTTP response should have a 200 status code

  Scenario: User logs in with valid credentials and logs out
    Given the user loads the homepage
    When they enter valid credentials
    Then they should access the main screen
    And they should see their username in the navigation bar
    When they log out
    Then they should return to the homepage without being authenticated
