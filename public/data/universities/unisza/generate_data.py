#!/usr/bin/env python3
import json
import os

base_dir = "/home/shami/projects/StudentsUni/public/data/universities/unisza"

university_info = {
    "name": "Universiti Sultan Zainal Abidin",
    "slug": "unisza",
    "abbreviation": "UniSZA",
    "type": "public-university",
    "state": "Terengganu",
    "website": "https://www.unisza.edu.my",
    "sources": [
        "https://www.unisza.edu.my",
        "https://www.studymalaysia.com/edu/unisza/courses/"
    ],
    "last_updated": "2026-09-14"
}

# Save info.json
with open(os.path.join(base_dir, "info.json"), "w") as f:
    json.dump(university_info, f, indent=2)

programs = {
    "foundation": [
        {
            "program_name": "Foundation in Science and Medicine",
            "duration": "2 Sem",
            "mode": "Full-time",
            "fees": {"local": "Enquire", "international": "Enquire"},
            "field": "Medicine & Healthcare"
        }
    ],
    "diploma": [
        {"program_name": "Diploma In Human Resource Management", "duration": "4 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "1400/sem"}, "field": "Business Management & Administration"},
        {"program_name": "Diploma In Islamic Broadcasting Media", "duration": "5 Sem", "mode": "Full-time", "fees": {"local": "Refer to University", "international": "Refer to University"}, "field": "Communication & Broadcasting"},
        {"program_name": "Diploma In Physiotherapy", "duration": "6 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "Enquire"}, "field": "Medicine & Healthcare"},
        {"program_name": "Diploma In Islamic Studies (Syariah)", "duration": "4 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "1200/sem"}, "field": "Humanities"},
        {"program_name": "Diploma in Nursing Science", "duration": "6 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "Enquire"}, "field": "Medicine & Healthcare"},
        {"program_name": "Diploma In Marketing", "duration": "4 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "Enquire"}, "field": "Business Management & Administration"},
        {"program_name": "Diploma In Islamic Studies (Islamic Administration)", "duration": "4 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "1200/sem"}, "field": "Humanities"},
        {"program_name": "Diploma In Radiographic", "duration": "6 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "1100/sem"}, "field": "Medical Diagnostic & Treatment Technology"},
        {"program_name": "Diploma In Industrial Design", "duration": "4 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "1100/sem"}, "field": "Arts & Design"},
        {"program_name": "Diploma in Islamic Studies (Islamic History and Civilization)", "duration": "4 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "1200/sem"}, "field": "Humanities"},
        {"program_name": "Diploma In Finance", "duration": "4 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "Enquire"}, "field": "Accounting & Finance"},
        {"program_name": "Diploma In Islamic Studies (Arabic Language & Literature)", "duration": "4 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "1400/sem"}, "field": "Languages"},
        {"program_name": "Diploma In Islamic Studies (Usuluddin)", "duration": "4 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "1200/sem"}, "field": "Humanities"},
        {"program_name": "Diploma In International Commerce", "duration": "4 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "1200/sem"}, "field": "Business Management & Administration"},
        {"program_name": "Diploma In Manufacturing Technology", "duration": "4 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "1100/sem"}, "field": "Manufacturing & Processing"},
        {"program_name": "Diploma In Insurance Studies", "duration": "4 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "1100/sem"}, "field": "Accounting & Finance"},
        {"program_name": "Diploma In Law", "duration": "4 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "1200/sem"}, "field": "Law"},
        {"program_name": "Diploma in Medical Laboratory Technology", "duration": "6 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "Enquire"}, "field": "Medical Diagnostic & Treatment Technology"},
        {"program_name": "Diploma in Islamic Studies (Dakwah)", "duration": "4 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "1400/sem"}, "field": "Humanities"},
        {"program_name": "Diploma in Information Technology", "duration": "4 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "1400/sem"}, "field": "Computing & IT"},
        {"program_name": "Diploma in Accounting", "duration": "5 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "1100/sem"}, "field": "Accounting & Finance"},
        {"program_name": "Diploma in Islamic Studies (Al Quran & Al Sunnah)", "duration": "4 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "729/sem"}, "field": "Humanities"},
        {"program_name": "Diploma in Banking Studies", "duration": "4 Sem", "mode": "Full-time", "fees": {"local": "300 - 400/sem", "international": "729/sem"}, "field": "Accounting & Finance"}
    ],
    "bachelor": [
        {"program_name": "Bachelor of International Relations (Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Social Sciences"},
        {"program_name": "Bachelor of Medicine and Surgery", "duration": "10 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "1100/sem"}, "field": "Medicine & Healthcare"},
        {"program_name": "Bachelor of Computer Science (Internet Computing) (Hons)", "duration": "7 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Computing & IT"},
        {"program_name": "Bachelor of Medical Science and Health (Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "Enquire", "international": "Enquire"}, "field": "Medicine & Healthcare"},
        {"program_name": "Bachelor of Manufacturing Engineering Technology (Product Design) (Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Engineering & Engineering Trades"},
        {"program_name": "Bachelor of Social Work (Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Social Services"},
        {"program_name": "Bachelor of Social Science (Anthropology and Dakwah)(Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Social Sciences"},
        {"program_name": "Bachelor of Agriculture Biotechnology (Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "1200/sem"}, "field": "Agriculture, Forestry, Fishery & Veterinary"},
        {"program_name": "Bachelor of Dietetics (Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Medicine & Healthcare"},
        {"program_name": "Bachelor of Animal Production and Health (Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "879/sem"}, "field": "Agriculture, Forestry, Fishery & Veterinary"},
        {"program_name": "Bachelor of Islamic Studies (Usuluddin)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "1100 - 1400/sem"}, "field": "Humanities"},
        {"program_name": "Bachelor of Islamic Studies (Dakwah)", "duration": "7 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "729/sem"}, "field": "Humanities"},
        {"program_name": "Bachelor of Arabic Studies (Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Languages"},
        {"program_name": "Bachelor of Usuluddin with Counselling (Hons)", "duration": "7 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "729/sem"}, "field": "Social Sciences"},
        {"program_name": "Bachelor of Polymer Technology (Hons)", "duration": "7 Sem", "mode": "Full-time", "fees": {"local": "Enquire", "international": "Enquire"}, "field": "Science"},
        {"program_name": "Bachelor of Islamic Wealth Management (Hons)", "duration": "6 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Accounting & Finance"},
        {"program_name": "Bachelor of Science (Aquatic Science) (Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Science"},
        {"program_name": "Bachelor of Agribusiness (Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Agriculture, Forestry, Fishery & Veterinary"},
        {"program_name": "Bachelor of Contemporary Malay Language with Interactive Media(Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "Enquire", "international": "Enquire"}, "field": "Languages"},
        {"program_name": "Bachelor of Public Relations with Contemporary Media", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "Enquire", "international": "Enquire"}, "field": "Communication & Broadcasting"},
        {"program_name": "Bachelor of Halal Food Development", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "Enquire", "international": "Enquire"}, "field": "Science"},
        {"program_name": "Bachelor of Medical Imaging (Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Medical Diagnostic & Treatment Technology"},
        {"program_name": "Bachelor of Plant Breeding Technology (Hons)", "duration": "7 Sem", "mode": "Full-time", "fees": {"local": "Enquire", "international": "Enquire"}, "field": "Agriculture, Forestry, Fishery & Veterinary"},
        {"program_name": "Bachelor of Nursing Science (Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "Enquire", "international": "Enquire"}, "field": "Medicine & Healthcare"},
        {"program_name": "Bachelor of Education (Islamic Education)", "duration": "4 Yrs", "mode": "Full-time", "fees": {"local": "Enquire", "international": "Enquire"}, "field": "Education"},
        {"program_name": "Bachelor of Agronomy (Hons)", "duration": "4 Yrs", "mode": "Full-time", "fees": {"local": "Enquire", "international": "Enquire"}, "field": "Agriculture, Forestry, Fishery & Veterinary"},
        {"program_name": "Bachelor Of Islamic Tourism With Honours", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "Enquire", "international": "Enquire"}, "field": "Hospitality & Tourism"},
        {"program_name": "Bachelor of Science Biomedicine (Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Science"},
        {"program_name": "Bachelor of Islamic Studies (Syariah)", "duration": "7 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Humanities"},
        {"program_name": "Bachelor of Information Technology (Informatics Media) (Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "Enquire", "international": "Enquire"}, "field": "Computing & IT"},
        {"program_name": "Bachelor of Food Science (Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Science"},
        {"program_name": "Bachelor of English Language with Communication (Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Languages"},
        {"program_name": "Bachelor of Food Technology (Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Manufacturing & Processing"},
        {"program_name": "Bachelor of Industrial Design (Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Arts & Design"},
        {"program_name": "Bachelor of Accountancy (Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Accounting & Finance"},
        {"program_name": "Bachelor of Al-Quran and As-Sunnah (Qiraat) (Hons)", "duration": "7 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Humanities"},
        {"program_name": "Bachelor of Business Administration (Islamic Finance) (Hons)", "duration": "6 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Business Management & Administration"},
        {"program_name": "Bachelor of Computer Science (Software Development) (Hons)", "duration": "7 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Computing & IT"},
        {"program_name": "Bachelor of Business Administration (Risk Management and Takaful)(Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Business Management & Administration"},
        {"program_name": "Bachelor of Pharmacy (Hons)", "duration": "4 Yrs", "mode": "Full-time", "fees": {"local": "Enquire", "international": "Enquire"}, "field": "Medicine & Healthcare"},
        {"program_name": "Bachelor of Computer Science (Computer Network Security) (Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "Enquire"}, "field": "Computing & IT"},
        {"program_name": "Bachelor of Law (Hons)", "duration": "8 Sem", "mode": "Full-time", "fees": {"local": "600 - 1000/sem", "international": "1200/sem"}, "field": "Law"}
    ]
}

def slugify(text):
    text = text.lower().strip()
    text = text.replace(" (hons)", "").replace("#", "").replace("  ", " ")
    text = text.replace("(", "").replace(")", "")
    text = text.replace("&", "and")
    text = text.replace(" ", "-")
    # Remove non-alphanumeric chars except -
    slug = "".join(c for c in text if c.isalnum() or c == '-')
    while '--' in slug:
        slug = slug.replace('--', '-')
    return slug

for level, progs in programs.items():
    index = []
    for p in progs:
        slug = slugify(p["program_name"])
        program_data = {
            "university": "Universiti Sultan Zainal Abidin",
            "university_slug": "unisza",
            "level": level,
            "program_name": p["program_name"],
            "slug": slug,
            "field": p["field"],
            "duration": p["duration"],
            "mode": p["mode"],
            "intakes": None,
            "fees": p["fees"],
            "requirements": None,
            "accreditation": None,
            "sources": ["https://www.studymalaysia.com/edu/unisza/courses/"],
            "confidence": 0.8,
            "last_updated": "2026-09-14"
        }
        
        # Write program file
        filepath = os.path.join(base_dir, level, f"{slug}.json")
        with open(filepath, "w") as f:
            json.dump(program_data, f, indent=2)
        
        index.append({"name": p["program_name"], "slug": slug})
    
    # Write index file
    with open(os.path.join(base_dir, level, "index.json"), "w") as f:
        json.dump(index, f, indent=2)

print("Data generation complete.")