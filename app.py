# import necessary libraries
import os
import numpy as np
import pandas as pd

from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Database Setup
#################################################
from flask_sqlalchemy import SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///db/belly_button_biodiversity.sqlite"

db = SQLAlchemy(app)

#query_statement = db.session.query("SELECT * FROM samples_metadata")
df = pd.read_sql_table("samples", db.session.bind)
transposed_df = df.transpose()


class Otu(db.Model):
    __tablename__ = 'otu'

    id = db.Column(db.Integer, primary_key=True)
    otu_id = db.Column(db.Integer)
    lowest_taxonomic_unit_found = db.Column(db.String(64))
    
    def __repr__(self):
        return '<Otu %r>' % (self.out_id)

class Samples(db.Model):
    __tablename__ = 'samples_metadata'

    id = db.Column(db.Integer, primary_key=True)
    SAMPLEID = db.Column(db.Integer)
    EVENT = db.Column(db.String(64))
    ETHNICITY = db.Column(db.String(64))
    GENDER = db.Column(db.String(64))
    AGE = db.Column(db.Integer)
    WFREQ = db.Column(db.Integer)
    BBTYPE = db.Column(db.String(64))
    LOCATION = db.Column(db.String(64))
    
    def __repr__(self):
        return '<Otu %r>' % (self.out_id)


@app.before_first_request
def setup():
    # Recreate database each time for demo
    # db.drop_all()
    db.create_all()


# create route that renders index.html template
@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/otu")
def list_otus():
    results = db.session.query(Otu.otu_id, Otu.lowest_taxonomic_unit_found).all()

    otus = []
    for result in results:
        string_otus = "BB_" + str(result[0])
        otus.append(string_otus)
    return jsonify(otus)
    
@app.route("/api/names")
def list_names():
    results = db.session.query(Otu.otu_id, Otu.lowest_taxonomic_unit_found).all()

    
    otus = []
    for result in results:
        otus.append(
            #"otu_id": result[0],
            #"taxonomic": 
            result[1]
        )
    return jsonify(otus)

    #results = db.session.query(Otu.otu_id).all()

@app.route('/metadata/<sample>')
def metadata(sample):
    results = db.session.query(Samples.SAMPLEID, Samples.AGE, Samples.BBTYPE, Samples.ETHNICITY, Samples.GENDER, Samples.LOCATION).filter(Samples.SAMPLEID == sample).all()

    
    metadata = []
    for result in results:
         metadata.append({
            "AGE": result[1],
            "BBTYPE": result[2],
            "ETHNICITY": result[3],
            "GENDER": result[4],
            "LOCATION": result[5],
            "ID": result[0]

         })
    return jsonify(metadata)

   

@app.route('/wfreq/<sample>')
def wfreq(sample):
    results = db.session.query(Samples.SAMPLEID, Samples.WFREQ).filter(Samples.SAMPLEID == sample).all()
    
    metadata = []
    for result in results:
         metadata.append({
            #"ID": result[0], 
            "WFREQ": result[1]
    #         #"taxonomic": 
    #         result[1]
         })
    #metadata = results[0]["SAMPLEID"]
    return jsonify(metadata)


@app.route("/samples/<sample>")
def samples_data(sample):
#     results = db.session.query(Otu.otu_id, Otu.lowest_taxonomic_unit_found).all()
    new_df = df[['otu_id',sample]]
    newer_df = new_df.sort_values(sample,ascending=False,inplace=False)
    
    column1 = 0
    column2 = 0
    sample_data = []
    otu_ids = []
    sample_values = []
    for i in range(0,3674):
        column1 = int(newer_df.iloc[i,0])
        column2 = int(newer_df.iloc[i,1])
        otu_ids.append(column1)
        sample_values.append(column2)

    sample_data.append({"otu_ids":otu_ids,"sample_values":sample_values})
    return jsonify(sample_data)   

@app.route("/pie")
def piechart():
    labels = []
    lyrics = []
    new_df = df[['otu_id','BB_941']]
    newer_df = new_df.sort_values('BB_941',ascending=False,inplace=False)
    column1 = 0
    column2 = 0
    for i in range(0,10):
        column1 = int(newer_df.iloc[i,0])
        column2 = int(newer_df.iloc[i,1])
        labels.append(column1)
        lyrics.append(column2) 
    #labels, values = zip(*lyrics.items())
    data = [{
        "labels": labels,
        "values": lyrics,
        "type": "pie"}]

    return jsonify(data) 

if __name__ == "__main__":
    app.run()
