#Assign the variable total on line 8!

meal = input("How much was your meal? ")
tax = input("How much was the tax? ")
tip = 0.15

meal = float(meal) + float(meal) * float(tax)
total = meal + meal * tip

print("Your total is " + "%.2f" % total)
