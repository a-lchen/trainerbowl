import sqlite3
conn = sqlite3.connect('../server/db/questions.db')
c = conn.cursor()

# # Create table
c.execute('''CREATE TABLE questions
             (PacketName text, QuestionID text, Question text, Power text)''')
c.execute('''CREATE TABLE answers
             (PacketName text, QuestionID text, Answer text)''')
c.execute('''CREATE TABLE prompts
             (PacketName text, QuestionID text, Prompt text)''')


# c.execute("INSERT INTO questions VALUES ('testid6','question3','power4','answer4','prompt4')")

# for row in c.execute('SELECT * FROM questions'):
#     print (row)

# Save (commit) the changes
conn.commit()

# We can also close the connection if we are done with it.
# Just be sure any changes have been committed or they will be lost.
conn.close()