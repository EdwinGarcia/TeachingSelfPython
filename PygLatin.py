def PygLatin(original):
	'''
        Type contract:
        (string) -> string
        
	Description:
	This is a Pig Latin translator. A user enters a word
	and it is translated. The logic is written as such.
	
	1. Ask the user to input a word in English
	2. Check to make sure the user entered a valid word
	3. Convert the word from English to Pig Latin
	4. Display the translation result

	Examples:
	>>>dog
	ogday
	>>>Brown
	rownbay
	'''

#Body
print("Welcome to the English to Pig Latin translator!")
pyg = 'ay'
original = input('Enter a word: ') #1. Ask the user to input a word in English

if len(original) > 0 and original.isalpha(): #2. Validates input.
	word = original.lower() #Converts input to lower case.
	first = word[0] #Pulls the first letter of the input so we can check if it is a vowel or consonant.
	if first in "aeiou" == True:
		new_word = word+pyg #3. If it is a vowel, we just add "ay" to the end.
		print(new_word) #4. Display the translated result.
	else:
		new_word = word[1:len(word)] + word[0] + pyg #3. Removed the first letter from "word", adds it to the end and adds "ay" to the end.
		print(new_word) #4. Display the translated result.
else:
	print('Empty or the input contains a number') #Error message for the user.
