#Recipe for Designing Functions:
# 1. Examples
# 2. Type Contract
# 3. Header
# 4. Description
# 5. Body
# 6. Test

# If you write out your functions in this order, you can think about how things will work logically and it flows naturally.

#header
def are(base, height):

#Type Contract
	'''(number, number) -> number

#Description
	Return the area of a triangle with dimensions base and height.

#Examples
	>>> area(10, 5)
	25.0
	>>> area(2.5, 3)
	3.75
	'''

#body
return base * height / 2