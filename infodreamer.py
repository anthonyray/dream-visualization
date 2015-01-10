# -*- coding: utf-8 -*-
import requests
from bs4 import BeautifulSoup
import pandas as pd
import re
import unicodedata


def getDetails(url):

	
	gender=''
	age=''
	age_1=''
	age_2=''
	marital_status=''
	education=''
	country=''

	r = requests.get(url)
	soup = BeautifulSoup(r.text,'html.parser')
	balises_even = soup.findAll("tr", class_="evenitem")
	balises_odd = soup.findAll("tr", class_="odditem")
	balises=balises_even + balises_odd



	for balise in balises:
		
		dreamer_info=pd.Series(balise.text.split("\n"))
		if dreamer_info[1] =='The gender of the participant, male or female.':
			gender=dreamer_info[2]
		elif dreamer_info[1] =='The age of the participant, in years.':
			age=dreamer_info[2]
		elif dreamer_info[1] =='Participants in the Demographic Survey 2010 sorted into four age groups.':
			age_1=dreamer_info[2]
		elif dreamer_info[1] =='Participants in the Demographic Survey 2010 sorted into five age groups.':
			age_1=dreamer_info[2]
		elif dreamer_info[1] =='Participants in the Sleep and Dream Survey 2007 sorted into 10 age groups.':
			age_1=dreamer_info[2]
		elif dreamer_info[1] =='Year of birth, for participants in the Sleep and Dream Survey 2007.':
			age_2=dreamer_info[2]
		elif dreamer_info[1] =='Marital status of participants in the Demographic Survey 2010.':
			marital_status=dreamer_info[2]
		elif dreamer_info[1] =='Marital status of participants in the Memorable Dream Survey 2011 and the Demographic Survey 2012.':
			marital_status=dreamer_info[2]
		elif dreamer_info[1] =='Educational background of participants in the Demographic Survey 2010.':
			education=dreamer_info[2]
		elif dreamer_info[1] =='Educational background of participants in the Memorable Dreams Survey 2011 and the Demographic Survey 2012.  Exact question: What is the highest level of education you have completed or the highest degree you have received?':
			education=dreamer_info[2]
		elif dreamer_info[1] =='Educational background of participants in the Sleep and Dream Survey 2007':
			education=dreamer_info[2]
		elif dreamer_info[1] =='Country of Residence':
			country=dreamer_info[2]
			


	result=pd.Series([ url, gender, age, age_1, age_2, marital_status, education, country], index=['url', 'gender', 'age', 'age_1', 'age_2', 'marital_status', 'education', 'country'])

 	return result

pieces=[]
columns=['url']
urls=pd.read_csv('urls.csv', names=columns)
liste=urls['url'].tolist()
i=1
for url in liste:
	result=getDetails(url)
	#if type(result)!=str:
	a=pd.DataFrame(result)
	pieces.append(a.transpose())
	i=i+1
	print i 
dreamer_DB = pd.concat(pieces)
dreamer_DB.to_csv('dreamer_DB.csv', encoding='utf-8')