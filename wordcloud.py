# -*- coding: utf-8 -*-
"""
Created on Fri Jan  9 15:39:08 2015

@author: roms
"""

import pandas as pd
from matplotlib import pyplot as plt
import nltk
from nltk.corpus import stopwords
from wordcloud import WordCloud
from nltk.stem import WordNetLemmatizer
from scipy.interpolate import interp1d


# loading files
file = '/home/roms/Desktop/Telecom/P2/Visualization/Projet/Data/reves.csv'
scraping = '/home/roms/Desktop/Telecom/P2/Visualization/Projet/GitHub/dream-visualization/dreamer_DB.csv'
data = pd.DataFrame.from_csv(file, sep = ',')

# useful functions
def filterStopWords(wordList):
    return [w for w in wordList if not w in stopwords.words('english')]

def filterPunctuation(wordList):
    punctuation = ['', '``', '\'\'', '...', '[', ']', '(', ')', '&', '_', '.', ',', ';', '!', '?', '\'', '\"', '+', '-', '*', '/' ]
    return [w for w in wordList if not w in punctuation]

def filterStopWords2(wordList):
    words = ['dream', 'none', 'got', 'n\'t', 'one', 'going', 'go', 'remember', 'wake', 'recall', 'ca', 'cant', 'dont']
    return [w for w in wordList if not w in words]

def applyLemma(wordList):
    for num, word in enumerate(wordList):
        wordnet_lemmatizer = WordNetLemmatizer()
        wordList[num] = wordnet_lemmatizer.lemmatize(word, pos='v')
    return wordList

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
plt.hist(data['size'].values, bins= range(0, 100, 1), weights = [1/len(data['size'])]*len(data['size']))

# we add tokens
data['tokens'] = data['text']
data['tokens'] = data['tokens'].fillna('').apply(lambda x : x.lower()).apply(lambda word : word.replace('\'s', ''))
data['tokens'] = data['tokens'].apply(nltk.word_tokenize)
data['tokens'] = data['tokens'].apply(applyLemma)
data['tokens'] = data['tokens'].apply(filterStopWords)
data['tokens'] = data['tokens'].apply(filterStopWords2)
data['tokens'] = data['tokens'].apply(filterPunctuation)

# scraping file merge
scrap = pd.DataFrame.from_csv(scraping, sep = ',')
scrap['personid'] = scrap['url'].apply(lambda x : x.replace('http://sleepanddreamdatabase.org/dream/person?personid=', ''))
merged = data.merge(scrap, how = 'left')
merged.drop(['url', 'age_1', 'age_2', 'country', 'tokens'], axis = 1).to_csv('/home/roms/Desktop/Telecom/P2/Visualization/Projet/GitHub/dream-visualization/merged_DB.csv')
mergedClean = merged.dropna(how = 'any', subset = ['gender', 'age', 'marital_status', 'education']).drop(['age_1', 'age_2', 'country'], axis = 1)
mergedClean['size'] = mergedClean['tokens'].apply(len).values
plt.hist(mergedClean['size'].values, bins= range(0, 100, 1), weights = [1/len(mergedClean['size'])]*len(mergedClean['size']))

# see tokens for some size
mergedClean['tokens'][mergedClean['size'] == 2]

# output one wordcount
allwords = wordcount(mergedClean['tokens'][mergedClean['size'] > 1])

newMin = 1
newMax = 100
actualMin = allwords.min()
actualMax = allwords.max()
convertScale = interp1d([actualMin, actualMax] ,[newMin, newMax])
allwords = pd.DataFrame(allwords, columns = ['values'])
allwords['scaled'] = pd.DataFrame(convertScale(allwords), index = allwords.index)
allwords.to_csv('/home/roms/Desktop/Telecom/P2/Visualization/Projet/GitHub/dream-visualization/wordcount.csv')
plt.plot(allwords['values'][:100])
plt.plot(allwords['scaled'][:100])


# some wordcounts
wc1 = wordcount(data['tokens'][data['questionid'] == 'Q15'])
wc2 = wordcount(data['tokens'][data['surveyid'] == 'harris_2012'])
males = wordcount(mergedClean['tokens'][(mergedClean['gender'] == 'Male') & (mergedClean['size'] > 1)])
females = wordcount(mergedClean['tokens'][(mergedClean['gender'] == 'Female') & (mergedClean['size'] > 1)])
deuxmots = wordcount(mergedClean['tokens'][(mergedClean['size'] == 2)])
lucid = wordcount(data['tokens'][data['personid'].apply(lambda x : 'lucid' in x)])

# see distribution of age for a given word
word = 'love'
variable = 'gender'
test = mergedClean[mergedClean['tokens'].apply(lambda x : word in x)]
plt.hist(test[variable].values, bins= range(0, 100, 1), weights = [1/len(test[variable].values)]*len(test[variable].values))
plt.hist(test[variable].values, bins = ['Male', 'Female'])

# plot wordcloud
reves = lucid
wordcloud = WordCloud().generate(seriesToString(reves))
plt.imshow(wordcloud)
plt.axis("off")
plt.show()
