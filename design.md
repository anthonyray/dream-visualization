# INF229 - Data Visualization Project

## Project description
This Data Visualization project aims at representing a database of transcripted dreams, written by different people over many years. We would like our visualization to give the ability to explore the content of people’s dream.

While dreams content is often conceived as random, sometimes even absurd, we hope our visualization will reveal patterns among populations. If this is not the case, our visualization should reveal the randomness or the inconsistency of dreams.

## Dataset
The dataset is an online database called the SleepandDreamDatabase (SDDb).

The SDDb is a digital archive designed to promote the empirical study of sleep and dreams. It provides access to a collection of several thousand dream reports from a variety of sources, including personal diaries, demographic surveys, experimental studies, and cultural texts.

At first, we wanted to augment this database with another compilation we found on the internet, but the data were too heterogeneous and the merging of the two databases would have not been possible.

Finally, our database is a 11MB file, that have the following fields :

|personid | Identifier of the dreamer
|---------|--------------------------
|**text**|Transcript of the dream
|**size** |Length of the dream
|**gender** | Gender of the dreamer
|**age** | Age of the dreamer
|**marital_status** | Marital status of the dreamer
|**education** | Education level of the dreamer


Our datasets consists of 15974 dreams.
The data was retrieved by crawling the sleepanddreamdatabase.org website. The data was then cleaned, and only consistent transcript were kept. We also got rid of low quality dream transcripts : We tokenized and lemmatized every transcript, got rid of stop words and we got rid of dreams where transcript length were under two words.
For instance : “No dreams” becomes an empty transcript and is not added to our dataset.

## Project design approaches
