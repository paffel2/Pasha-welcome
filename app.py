import os
from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "a secret key"
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
db.init_app(app)

with app.app_context():
    import models
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/leaderboard')
def leaderboard():
    scores = models.Score.query.order_by(models.Score.score.desc()).limit(10).all()
    return render_template('leaderboard.html', scores=scores)

@app.route('/submit_score', methods=['POST'])
def submit_score():
    data = request.get_json()
    new_score = models.Score(
        player_name=data['player_name'],
        score=data['score'],
        date=datetime.utcnow()
    )
    db.session.add(new_score)
    db.session.commit()
    return jsonify({'status': 'success'})

@app.route('/get_scores')
def get_scores():
    scores = models.Score.query.order_by(models.Score.score.desc()).limit(10).all()
    return jsonify([{
        'player_name': score.player_name,
        'score': score.score,
        'date': score.date.strftime('%Y-%m-%d')
    } for score in scores])
