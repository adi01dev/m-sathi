
import os
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.platypus import Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Try to register Indic fonts if available
try:
    # Register a Hindi font (Noto Sans Devanagari)
    pdfmetrics.registerFont(
        TTFont('NotoSansDevanagari', 'NotoSansDevanagari-Regular.ttf')
    )
    HAS_INDIC_FONTS = True
except:
    HAS_INDIC_FONTS = False

# Import plotting library for mood charts
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from io import BytesIO
import numpy as np

def generate_mood_chart(mood_entries, output_path):
    """Generate a chart of mood scores over time"""
    if not mood_entries:
        return None
        
    # Extract dates and scores
    dates = [datetime.fromisoformat(entry.get('date', '').replace('Z', '+00:00')) 
             for entry in mood_entries]
    scores = [entry.get('moodScore', 5) for entry in mood_entries]
    labels = [entry.get('moodLabel', 'neutral') for entry in mood_entries]
    
    # Create color mapping for mood labels
    mood_colors = {
        'joyful': '#FFD700',      # Gold
        'happy': '#32CD32',       # Lime Green
        'calm': '#87CEEB',        # Sky Blue
        'relaxed': '#98FB98',     # Pale Green
        'neutral': '#D3D3D3',     # Light Gray
        'anxious': '#FFA07A',     # Light Salmon
        'stressed': '#FF8C00',    # Dark Orange
        'sad': '#6495ED',         # Cornflower Blue
        'depressed': '#4682B4'    # Steel Blue
    }
    
    # Create figure
    plt.figure(figsize=(10, 4))
    
    # Create scatter plot with colored points
    for i, (date, score, label) in enumerate(zip(dates, scores, labels)):
        plt.scatter(date, score, color=mood_colors.get(label, '#D3D3D3'), s=100, alpha=0.7)
    
    # Add connecting line
    plt.plot(dates, scores, color='#A9A9A9', linestyle='-', linewidth=1, alpha=0.5)
    
    # Format the plot
    plt.title('Your Mood Journey')
    plt.xlabel('Date')
    plt.ylabel('Mood Score (1-10)')
    plt.ylim(0.5, 10.5)
    plt.yticks(range(1, 11))
    
    # Format the date axis
    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%d %b'))
    plt.gca().xaxis.set_major_locator(mdates.DayLocator())
    
    # Add grid
    plt.grid(True, linestyle='--', alpha=0.7)
    
    # Add mood score labels
    for i, score in enumerate(scores):
        plt.annotate(str(score), (mdates.date2num(dates[i]), scores[i]),
                    xytext=(0, 10), textcoords='offset points',
                    ha='center', va='bottom',
                    fontsize=9)
    
    # Improve layout
    plt.tight_layout()
    
    # Save to a BytesIO object
    img_buffer = BytesIO()
    plt.savefig(img_buffer, format='png', dpi=150)
    plt.close()
    img_buffer.seek(0)
    
    # Save to file
    with open(output_path, 'wb') as f:
        f.write(img_buffer.getvalue())
    
    return output_path

def generate_wellness_report(filename, user_id, mood_entries, completed_recommendations, 
                           streak_data, start_date_str, end_date_str):
    """
    Generate a PDF wellness report
    
    Parameters:
    filename (str): Output filename
    user_id (str): User ID
    mood_entries (list): List of mood entry objects
    completed_recommendations (list): List of completed recommendation objects
    streak_data (dict): Streak and plant growth information
    start_date_str (str): Start date of the report period
    end_date_str (str): End date of the report period
    
    Returns:
    str: Path to the generated PDF file
    """
    try:
        # Create output directory if it doesn't exist
        output_dir = 'reports'
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, filename)
        
        # Generate mood chart
        chart_filename = f"mood_chart_{user_id}.png"
        chart_path = os.path.join(output_dir, chart_filename)
        generate_mood_chart(mood_entries, chart_path)
        
        # Create PDF document
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        # Get styles
        styles = getSampleStyleSheet()
        title_style = styles["Title"]
        heading_style = styles["Heading1"]
        heading2_style = styles["Heading2"]
        normal_style = styles["Normal"]
        
        # Create custom styles
        if HAS_INDIC_FONTS:
            hindi_style = ParagraphStyle(
                'HindiStyle',
                parent=normal_style,
                fontName='NotoSansDevanagari',
                fontSize=11,
                leading=14
            )
        else:
            hindi_style = normal_style
            
        # Create a style for callouts
        callout_style = ParagraphStyle(
            'Callout',
            parent=normal_style,
            fontSize=10,
            textColor=colors.darkblue,
            backColor=colors.lightblue,
            borderColor=colors.blue,
            borderWidth=1,
            borderPadding=5,
            borderRadius=5,
            leading=14
        )
        
        # Start building the document content
        content = []
        
        # Title
        content.append(Paragraph("Mental Health Mirror", title_style))
        content.append(Paragraph("Weekly Wellness Report", heading_style))
        content.append(Spacer(1, 0.5*inch))
        
        # Report period
        start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
        
        period_text = f"Report Period: {start_date.strftime('%d %B %Y')} to {end_date.strftime('%d %B %Y')}"
        content.append(Paragraph(period_text, normal_style))
        
        # Add bilingual greeting (English and Hindi)
        content.append(Spacer(1, 0.3*inch))
        if HAS_INDIC_FONTS:
            content.append(Paragraph("आपकी मानसिक स्वास्थ्य यात्रा का साप्ताहिक विश्लेषण", hindi_style))
            content.append(Paragraph("(Your weekly mental health journey analysis)", normal_style))
        
        content.append(Spacer(1, 0.5*inch))
        
        # Mood Summary Section
        content.append(Paragraph("Mood Summary", heading2_style))
        content.append(Spacer(1, 0.2*inch))
        
        # Calculate average mood
        if mood_entries:
            avg_mood = sum(entry.get('moodScore', 5) for entry in mood_entries) / len(mood_entries)
            content.append(Paragraph(f"Average Mood: {avg_mood:.1f}/10", normal_style))
            
            # Count entries by mood label
            mood_counts = {}
            for entry in mood_entries:
                label = entry.get('moodLabel', 'neutral')
                mood_counts[label] = mood_counts.get(label, 0) + 1
            
            # Create mood distribution text
            if mood_counts:
                mood_text = "Mood Distribution: "
                for label, count in mood_counts.items():
                    percentage = (count / len(mood_entries)) * 100
                    mood_text += f"{label.capitalize()} ({percentage:.0f}%), "
                mood_text = mood_text.rstrip(", ")
                content.append(Paragraph(mood_text, normal_style))
        else:
            content.append(Paragraph("No mood entries recorded during this period.", normal_style))
        
        content.append(Spacer(1, 0.3*inch))
        
        # Add mood chart if available
        if os.path.exists(chart_path):
            content.append(Paragraph("Your Mood Trend", normal_style))
            content.append(Spacer(1, 0.1*inch))
            content.append(Image(chart_path, width=450, height=180))
            content.append(Spacer(1, 0.3*inch))
        
        # Add insight callout
        insight_text = "Your emotions show normal fluctuations throughout the week. Remember that ups and downs are a natural part of the human experience."
        
        # Calculate dominant mood if possible
        if mood_counts:
            dominant_mood = max(mood_counts.items(), key=lambda x: x[1])[0]
            
            if dominant_mood in ["joyful", "happy"]:
                insight_text = "You've had a predominantly positive week! Continue practices that bring you joy."
            elif dominant_mood in ["anxious", "stressed"]:
                insight_text = "You've experienced heightened stress this week. Consider adding more relaxation practices to your routine."
            elif dominant_mood in ["sad", "depressed"]:
                insight_text = "You've faced some challenging emotions this week. Remember to be gentle with yourself and reach out for support if needed."
        
        content.append(Paragraph(f"<b>Insight:</b> {insight_text}", callout_style))
        content.append(Spacer(1, 0.5*inch))
        
        # Streak and Plant Section
        content.append(Paragraph("Growth Journey", heading2_style))
        content.append(Spacer(1, 0.2*inch))
        
        streak_count = streak_data.get('current', 0)
        plant_level = streak_data.get('plantLevel', 'seed')
        
        content.append(Paragraph(f"Current Streak: {streak_count} days", normal_style))
        content.append(Paragraph(f"Plant Growth Level: {plant_level.capitalize()}", normal_style))
        
        # Growth progress bar (as a table)
        growth_data = []
        
        # Plant levels in order
        plant_levels = ['seed', 'sprout', 'leaf', 'flower', 'tree']
        try:
            current_level_index = plant_levels.index(plant_level)
            progress = ((current_level_index + 1) / len(plant_levels)) * 100
        except ValueError:
            progress = 0
            
        # Create progress bar row
        progress_bar = [["Progress:"] + [" "] * 10]
        filled_cells = int(10 * progress / 100)
        
        growth_data.append(progress_bar[0])
        
        # Add percentage row
        growth_data.append([f"{progress:.0f}% Complete"])
        
        # Create table with progress bar
        progress_table = Table(growth_data, colWidths=[80] + [20] * 10)
        
        # Style the progress bar
        table_style = TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, colors.white),
            ('BACKGROUND', (0, 0), (0, 0), colors.lightgrey),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ])
        
        # Add color to filled cells
        for i in range(filled_cells):
            table_style.add('BACKGROUND', (i+1, 0), (i+1, 0), colors.green)
            
        progress_table.setStyle(table_style)
        content.append(progress_table)
        content.append(Spacer(1, 0.3*inch))
        
        # Add streak insight
        streak_tip = "Regular check-ins help build self-awareness and emotional intelligence."
        if streak_count > 7:
            streak_tip = "Impressive streak! Your consistency shows your commitment to mental wellness."
        elif streak_count < 3:
            streak_tip = "Getting started is often the hardest part. Small, consistent steps lead to meaningful change."
            
        content.append(Paragraph(f"<b>Streak Insight:</b> {streak_tip}", callout_style))
        content.append(Spacer(1, 0.5*inch))
        
        # Completed Activities Section
        content.append(Paragraph("Completed Activities", heading2_style))
        content.append(Spacer(1, 0.2*inch))
        
        if completed_recommendations:
            # Group by type
            recommendations_by_type = {}
            for rec in completed_recommendations:
                rec_type = rec.get('type', 'other')
                if rec_type not in recommendations_by_type:
                    recommendations_by_type[rec_type] = []
                recommendations_by_type[rec_type].append(rec)
            
            # Add summary
            content.append(Paragraph(f"You completed {len(completed_recommendations)} wellness activities this week!", normal_style))
            content.append(Spacer(1, 0.2*inch))
            
            # Add table of completed activities
            activities_data = [["Activity", "Type", "Duration"]]
            for rec in completed_recommendations[:10]:  # Limit to first 10
                activities_data.append([
                    rec.get('title', 'Activity'),
                    rec.get('type', 'Other').capitalize(),
                    rec.get('duration', '- min')
                ])
            
            activities_table = Table(activities_data, colWidths=[250, 100, 80])
            activities_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.white])
            ]))
            
            content.append(activities_table)
            
        else:
            content.append(Paragraph("No activities completed during this period.", normal_style))
            content.append(Paragraph("Try completing recommended activities to improve your mental wellbeing.", normal_style))
            
        content.append(Spacer(1, 0.3*inch))
        
        # Add activity recommendation based on mood
        if mood_entries:
            recent_moods = [entry.get('moodLabel', 'neutral') for entry in mood_entries[-3:]]
            
            recommendation_text = "Based on your recent moods, try activities that promote balance and self-awareness."
            
            # Check if recent moods are predominantly negative
            negative_moods = ['anxious', 'stressed', 'sad', 'depressed']
            if any(mood in negative_moods for mood in recent_moods):
                recommendation_text = "Consider activities that promote relaxation and positive emotions, such as gentle yoga or gratitude journaling."
            
            # Check if recent moods are predominantly positive
            positive_moods = ['joyful', 'happy', 'calm', 'relaxed']
            if all(mood in positive_moods for mood in recent_moods):
                recommendation_text = "You're doing well! Continue with activities that maintain your positive state, and consider sharing your strategies with others."
                
            content.append(Paragraph(f"<b>Activity Suggestion:</b> {recommendation_text}", callout_style))
        
        content.append(Spacer(1, 0.5*inch))
        
        # Looking Ahead Section
        content.append(Paragraph("Looking Ahead", heading2_style))
        content.append(Spacer(1, 0.2*inch))
        
        next_week_text = "For the coming week, set a small goal related to your mental wellbeing. It could be as simple as a 5-minute daily meditation or spending time in nature."
        content.append(Paragraph(next_week_text, normal_style))
        
        # Add a quote
        quotes = [
            "\"The greatest weapon against stress is our ability to choose one thought over another.\" - William James",
            "\"You don't have to control your thoughts. You just have to stop letting them control you.\" - Dan Millman",
            "\"There is no health without mental health.\" - Dr. David Satcher",
            "\"Mental health is not a destination, but a process.\" - Noam Shpancer",
            "\"The mind is everything. What you think you become.\" - Buddha"
        ]
        
        content.append(Spacer(1, 0.3*inch))
        content.append(Paragraph(f"<i>{random.choice(quotes)}</i>", normal_style))
        
        content.append(Spacer(1, 0.5*inch))
        
        # Footer
        footer_text = f"Generated by Mental Health Mirror on {datetime.now().strftime('%d %B %Y')}"
        content.append(Paragraph(footer_text, styles["Italic"]))
        
        # Build PDF document
        doc.build(content)
        
        return output_path
        
    except Exception as e:
        print(f"Error generating PDF report: {str(e)}")
        return None
