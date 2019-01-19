from xml.dom import minidom
import re
import simplejson
import pymongo
from pymongo import MongoClient

client = MongoClient('mongodb://user:pass@ds153958.mlab.com:53958/qb-questions')

xmldoc = minidom.parse('output.xml') #get the correct xml file
boxes = xmldoc.getElementsByTagName('textbox') #find every  single textbox. Many of these contain a question each.
answerlist = [] #list of list of answers. index i corresponds to a list of answers for question i.
questionlist = []
for b in boxes:
	answerState = False
	answers = [] #init list for this question's answers
	if (b.firstChild and b.getElementsByTagName('text')[0].firstChild.nodeValue == "("): #if this is a question. Note that the character of choice is the (
		question = b.getElementsByTagName('text') #get all text elements in this question. question is a list of textelements, each of which contain a letter.
		answer = []
		qtext = []
		for i in range(len(question)):
			letter = question[i].firstChild.nodeValue #get the letter
			if (letter == "\n"):
				qtext.append(" ")
			else:
				qtext.append(letter)
			if 'size' in list(question[i].attributes.keys()):
				size = question[i].attributes['size'].value #get the size of this
			if ("".join([s.firstChild.nodeValue for s in question[i-6:i]]) == "ANSWER"): #check if we're at the answer part of this question
				answerState = True
			if (answerState and float(size) > 14): #if bolded and we're at the answer (remember, there are powers)
				answer.append(letter)
			if (not ('size' in list(question[i].attributes.keys())) and answerState and i < len(question)-1): #if it's a space, we're in the answer section, and not at the end
				if ('size' in list(question[i+1].attributes.keys()) and float(question[i+1].attributes['size'].value) < 14 and len(answer) > 0): #check if the next char is bolded
					if (answer[-1] == " " or answer[-2:] == "\n"):
						answer.pop()
					answers.append("".join(answer)) #if it isn't bolded, we know we're at the end of one answer (continue to the next possible answer, so reset.)
					answer = []
				
		if (len(answer) > 0):
			if (answer[-1] == " " or answer[-1] == "\n"):
				answer.pop()
			answers.append("".join(answer)) #catch the last answer
		answerlist.append(answers)
		questionlist.append("".join(qtext).split("ANSWER")[0]) #get the question part of the text

final = "{\"packet\": [\n"

for i in range(len(questionlist)):
	question = questionlist[i].replace("\"", "\\" + "\"") #format question
	answer = []
	for a in answerlist[i]:
		answer.append("\"" + re.sub(r'\([^)]*\)', '', a.replace("\"", "\\" + "\"")) + "\"") #format answer
	if answer != []:
		final += "{\"question\": " + "\"" + question +  "\", \"answer\": " + "[" + ", ".join(answer) + "]" + "}," + "\n" #format into json

# Get the sampleDB database
db = client.get_default_database()
qs = db.questions

final = final[:-2]

final += "\n"

final += "]}"

print(final)

#j = json.loads(final)

#
j = simplejson.loads(final)

print(j)
print("------------------------------------------------------")
qs.insert(j)






