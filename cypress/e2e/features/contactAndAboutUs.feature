Feature: Contact and About Us Navigation

  Scenario: User navigates to Contact page and sends a message
    Given the user loads the homepage
    When they click on the "Contact" link in the header
    Then they should see the contact modal
    And the modal should contain a contact form
    When they complete the contact form with valid data
    And they click on the "Send message" button

  Scenario: User navigates to About Us page
    Given the user loads the homepage
    When they click on the "About us" link in the header
    Then they should see the About us modal
    And the modal should contain a video
    And they should see an error message if the video cannot be loaded
    And the modal should close when clicking the Close button 