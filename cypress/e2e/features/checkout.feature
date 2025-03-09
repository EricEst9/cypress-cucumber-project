Feature: Complete Checkout Flow

  Scenario: User completes a full purchase process
    Given the user loads the homepage
    When they navigate to the cart
    Then they wait for the cart to load
    And they should see the cart is empty

    When they go back to the homepage
    And they select a product
    And they add the product to the cart twice
    And they navigate to the cart
    Then they wait for the cart to load
    And they should see 2 units of the selected product
    And they should see the correct total price

    When they remove one unit from the cart
    Then the total price should be updated accordingly

    When they go back to the homepage
    And they select a different product three times
    And they navigate to the cart
    Then they wait for the cart to load
    And they should see all previously added products
    And they should see the correct total price

    When they click on "Place Order"
    Then they should see the checkout modal
    And the total price in the modal should match the cart total

    When they fill in the checkout form
      | field       | value            |
      | name        | John Doe         |
      | country     | USA              |
      | city        | New York         |
      | creditCard  | 1234 5678 9876   |
      | month       | 12               |
      | year        | 2026             |
    And they click on "Purchase"
    
    Then they should see a confirmation modal with the message "Thank you for your purchase!"
    And the confirmation details should match the entered data
    And the total price should match the cart total

    When they click on "OK"
    Then they should be redirected to the homepage 