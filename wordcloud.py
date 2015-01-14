# -*- coding: utf-8 -*-
"""
Created on Fri Jan  9 15:39:08 2015

@author: roms
"""

import pandas as pd
import numpy as np
from matplotlib import pyplot as plt
import math
import nltk
from nltk.corpus import stopwords
from wordcloud import WordCloud

# loading files
file = '/home/roms/Desktop/Telecom/P2/Visualization/Projet/Data/reves.csv'
data = pd.DataFrame.from_csv(file, sep = ',')

# useful functions
def filterStopWords(wordList):
    return [w for w in wordList if not w in stopwords.words('english')]

def filterPunctuation(wordList):
    punctuation = ['', '``', '\'\'', '...', '[', ']', '(', ')', '&', '_', '.', ',', ';', '!', '?', '\'', '\"', '+', '-', '*', '/' ]
    return [w for w in wordList if not w in punctuation]

def wordcount(series):
    # words are gathered in a single list
    series = [item for sublist in series for item in sublist]
    # punctuation and stopwords are filtered
    series = filterStopWords(series)
    series = filterPunctuation(series)
    words = pd.DataFrame(series)
    return words[0].value_counts(sort = True, ascending = False)

def seriesToString(series):
    result = ''
    times = series.values
    words = series.index
    for num, word in enumerate(words):
        result = result + (word + ' ') * times[num]
    return result


# mining
data['questionid'].value_counts() # 27 questions
data['surveyid'].value_counts() # 57 surveys
data['personid'].value_counts() # 14522 persons
data['size'] = data['text'].apply(lambda x : len(str(x)))

# some facts about data
plt.title('Nombre de mots par rêve')
plt.hist(data['size'].values, bins= range(0, 1000, 100), weights = [1/len(data['size'])]*len(data['size']))

# we add tokens
data['tokens'] = data['text']
data['tokens'] = data['tokens'].fillna('').apply(lambda x : x.lower()).apply(lambda word : word.replace('\'s', ''))
data['tokens'] = data['tokens'].apply(nltk.word_tokenize)
# data['tokens'] = data['tokens'].apply(filterStopWords)

# some wordcount
wc1 = wordcount(data['tokens'][data['questionid'] == 'Q15'])
wc2 = wordcount(data['tokens'][data['surveyid'] == 'harris_2012'])


plt.plot(wc2.values[:50])
wc2[:20]

wordcloud = WordCloud().generate(seriesToString(wc2))
plt.imshow(wordcloud)
plt.axis("off")
plt.show()

