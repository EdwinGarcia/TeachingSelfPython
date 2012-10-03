#Converts temps from Fahrenheit to Celsius.

def convert_to_celsius(fahrenheit):
'''(number) -> float

Returns the numver of Celsius degrees in Fahrenheit.

>>> convert_to_celsius(32)
0.0
>>> convert_to_celsius(212)
100.0
'''

return (fahrenheit - 32) * 5 / 9