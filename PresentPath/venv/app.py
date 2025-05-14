from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

# Load model and encoder
model = joblib.load('student_feedback_model.pkl')
le = joblib.load('feedback_encoder.pkl')

# Feedback Functions
def feedback_year1(avg):
    if avg >= 8.5:
        return "Year 1: Strong foundation built. Excellent start!"
    elif avg >= 7:
        return "Year 1: Good work. Focus on consistency going forward."
    elif avg >= 5.5:
        return "Year 1: Decent beginning. Improve basics for upcoming years."
    else:
        return "Year 1: Struggled with core concepts. Seek help and review fundamentals."

def feedback_year2(avg):
    if avg >= 8.5:
        return "Year 2: Great improvement. Keep pushing forward!"
    elif avg >= 7:
        return "Year 2: Good performance. Some areas need refining."
    elif avg >= 5.5:
        return "Year 2: Average performance. Put more focus on growth."
    else:
        return "Year 2: Below expectations. Time to regroup and work smarter."

def feedback_year3(avg):
    if avg >= 8.5:
        return "Year 3: Outstanding progress. You're on the right path!"
    elif avg >= 7:
        return "Year 3: Solid results. Aim for excellence next year."
    elif avg >= 5.5:
        return "Year 3: Fair effort. Step up to meet upcoming challenges."
    else:
        return "Year 3: Major gaps remain. Intensive effort needed."

def feedback_year4(avg):
    if avg >= 8.5:
        return "Year 4: Excellent finish to the academic journey!"
    elif avg >= 7:
        return "Year 4: Good closure. Could polish some skills."
    elif avg >= 5.5:
        return "Year 4: Acceptable results. Consistency needed."
    else:
        return "Year 4: Disappointing final year. Reassess priorities."

def feedback_overall(avg):
    if avg >= 8.5:
        return (
            "Your overall performance is truly exceptional, reflecting a consistent and outstanding level of academic excellence. "
            "You demonstrate a profound understanding of the material, coupled with remarkable skills in critical thinking, presentation, and engagement. "
            "Your ability to deliver high-quality work under pressure and maintain a high standard across all assessed areas sets you apart as a top performer. "
            "Continue to leverage your strengths and seek opportunities to mentor peers, as your capabilities indicate significant potential for leadership and further academic success."
        )
    elif avg >= 7:
        return (
            "You have established yourself as a strong and reliable academic performer, consistently delivering solid results across various assessments. "
            "Your work reflects a good grasp of key concepts, effective communication skills, and a commendable level of dedication. "
            "While you excel in many areas, there may be opportunities to refine specific skills, such as enhancing creativity in presentations or deepening analytical insights. "
            "By focusing on these areas, you can elevate your performance to an even higher level and unlock your full potential."
        )
    elif avg >= 5.5:
        return (
            "Your academic journey reflects an average performance with clear potential that remains untapped. "
            "You demonstrate a foundational understanding of the material and are capable of meeting basic expectations, but there is room for growth in areas such as content depth, presentation skills, or time management. "
            "Engaging more actively with feedback, seeking additional resources, and practicing consistently can help you build confidence and improve your outcomes. "
            "With focused effort, you have the opportunity to transform your performance and achieve greater success."
        )
    else:
        return (
            "Your academic performance indicates a need for significant improvement to meet expected standards. "
            "While you may face challenges in areas such as content quality, engagement, or effective time management, these are opportunities for growth. "
            "Consider working closely with instructors, utilizing academic support resources, and developing a structured study plan to address weaknesses. "
            "With dedication and persistence, you can make meaningful progress and build a stronger foundation for future academic endeavors."
        )
def generate_feedback(avg, year=None):
    if year == 1:
        return feedback_year1(avg)
    elif year == 2:
        return feedback_year2(avg)
    elif year == 3:
        return feedback_year3(avg)
    elif year == 4:
        return feedback_year4(avg)
    return feedback_overall(avg)

@app.route('/')
def index():
    return "Student Feedback API is running."

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    try:
        scores = [
            data['content_quality'],
            data['presentation_skills'],
            data['slide_design'],
            data['engagement'],
            data['time_management'],
            data['year']
        ]
        avg_score = np.mean(scores[:-1])  # exclude year from avg

        prediction = model.predict([scores])
        feedback = le.inverse_transform(prediction)[0]

        yearly_feedback = generate_feedback(avg_score, data['year'])
        overall_feedback = feedback_overall(avg_score)

        return jsonify({
            'feedback': feedback,
            'yearly_feedback': yearly_feedback,
            'overall_feedback': overall_feedback
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/overall-feedback', methods=['POST'])
def overall_feedback_route():
    data = request.json
    try:
        avg = float(data['average'])
        result = feedback_overall(avg)
        return jsonify({'overall_feedback': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
