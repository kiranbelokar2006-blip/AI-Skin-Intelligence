from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
import sqlite3
import json
import os


# =========================================================
# SKINAI BACKEND - MILESTONE 3
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "skinai.db")

app = FastAPI(
    title="SkinAI API",
    version="3.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATABASE
# =========================================================

def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def table_columns(connection, table_name):
    rows = connection.execute(
        f"PRAGMA table_info({table_name})"
    ).fetchall()

    return {row["name"] for row in rows}


def add_column_if_missing(
    connection,
    table_name,
    column_name,
    definition
):
    columns = table_columns(connection, table_name)

    if column_name not in columns:
        connection.execute(
            f"ALTER TABLE {table_name} "
            f"ADD COLUMN {column_name} {definition}"
        )


def init_db():

    connection = get_connection()
    cursor = connection.cursor()

    # USERS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'User',
            created_at TEXT
        )
    """)

    # SKIN PROFILE
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS skin_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            age INTEGER,
            skin_type TEXT,
            concern TEXT,
            sensitivity TEXT,
            updated_at TEXT
        )
    """)

    # LIFESTYLE
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS lifestyle (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            water TEXT,
            sleep TEXT,
            exercise TEXT,
            updated_at TEXT
        )
    """)

    # ASSESSMENTS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            skin_health_score REAL DEFAULT 0,
            acne_score REAL DEFAULT 0,
            pigmentation_score REAL DEFAULT 0,
            dryness_score REAL DEFAULT 0,
            oiliness_score REAL DEFAULT 0,
            sensitivity_score REAL DEFAULT 0,
            risk_factors TEXT,
            priority_concern TEXT,
            ai_assessment TEXT,
            recommendations TEXT,
            created_at TEXT
        )
    """)

    # SHARED REPORTS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS shared_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            user_name TEXT,
            assessment_id INTEGER,
            status TEXT DEFAULT 'Shared',
            dermatologist_name TEXT,
            dermatologist_recommendation TEXT,
            shared_at TEXT,
            reviewed_at TEXT
        )
    """)

    # INGREDIENTS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ingredients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            purpose TEXT,
            suitable_skin TEXT,
            concerns TEXT,
            benefits TEXT,
            pros TEXT,
            cons TEXT,
            irritation TEXT,
            allergy_warning TEXT,
            interaction_notes TEXT
        )
    """)

    # PRODUCTS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            brand TEXT NOT NULL DEFAULT 'SkinAI',
            category TEXT,
            skin_type TEXT,
            concern TEXT,
            price REAL DEFAULT 0,
            description TEXT,
            ingredients TEXT
        )
    """)

    # ROUTINE TRACKING
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS routine_tracking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            tracking_date TEXT,
            routine_type TEXT,
            completed INTEGER DEFAULT 0,
            morning_completed INTEGER DEFAULT 0,
            evening_completed INTEGER DEFAULT 0,
            notes TEXT
        )
    """)

    # PROGRESS TRACKING
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS progress_tracking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            date TEXT,
            score REAL DEFAULT 0,
            concern TEXT,
            notes TEXT,
            created_at TEXT
        )
    """)


    # =====================================================
    # SAFE MIGRATION FOR OLD DATABASE
    # =====================================================

    migrations = {

        "users": {
            "name": "TEXT",
            "email": "TEXT",
            "password": "TEXT",
            "role": "TEXT DEFAULT 'User'",
            "created_at": "TEXT"
        },

        "skin_profiles": {
            "email": "TEXT",
            "age": "INTEGER",
            "skin_type": "TEXT",
            "concern": "TEXT",
            "sensitivity": "TEXT",
            "updated_at": "TEXT"
        },

        "lifestyle": {
            "email": "TEXT",
            "water": "TEXT",
            "sleep": "TEXT",
            "exercise": "TEXT",
            "updated_at": "TEXT"
        },

        "assessments": {
            "email": "TEXT",
            "skin_health_score": "REAL DEFAULT 0",
            "acne_score": "REAL DEFAULT 0",
            "pigmentation_score": "REAL DEFAULT 0",
            "dryness_score": "REAL DEFAULT 0",
            "oiliness_score": "REAL DEFAULT 0",
            "sensitivity_score": "REAL DEFAULT 0",
            "risk_factors": "TEXT",
            "priority_concern": "TEXT",
            "ai_assessment": "TEXT",
            "recommendations": "TEXT",
            "created_at": "TEXT"
        },

        "shared_reports": {
            "email": "TEXT",
            "user_name": "TEXT",
            "assessment_id": "INTEGER",
            "status": "TEXT DEFAULT 'Shared'",
            "dermatologist_name": "TEXT",
            "dermatologist_recommendation": "TEXT",
            "shared_at": "TEXT",
            "reviewed_at": "TEXT"
        },

        "ingredients": {
            "name": "TEXT",
            "purpose": "TEXT",
            "suitable_skin": "TEXT",
            "concerns": "TEXT",
            "benefits": "TEXT",
            "pros": "TEXT",
            "cons": "TEXT",
            "irritation": "TEXT",
            "allergy_warning": "TEXT",
            "interaction_notes": "TEXT"
        },

        "products": {
            "name": "TEXT",
            "brand": "TEXT NOT NULL DEFAULT 'SkinAI'",
            "category": "TEXT",
            "skin_type": "TEXT",
            "concern": "TEXT",
            "price": "REAL DEFAULT 0",
            "description": "TEXT",
            "ingredients": "TEXT"
        },

        "routine_tracking": {
            "email": "TEXT",
            "tracking_date": "TEXT",
            "routine_type": "TEXT",
            "completed": "INTEGER DEFAULT 0",
            "morning_completed": "INTEGER DEFAULT 0",
            "evening_completed": "INTEGER DEFAULT 0",
            "notes": "TEXT"
        },

        "progress_tracking": {
            "email": "TEXT",
            "date": "TEXT",
            "score": "REAL DEFAULT 0",
            "concern": "TEXT",
            "notes": "TEXT",
            "created_at": "TEXT"
        }
    }


    for table_name, columns in migrations.items():

        for column_name, definition in columns.items():

            add_column_if_missing(
                connection,
                table_name,
                column_name,
                definition
            )


    connection.commit()
    connection.close()


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def now_text():
    return datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )


def clean(value):

    if value is None:
        return ""

    return str(value).strip()


def normalize_text(value):

    return clean(value).lower()


def parse_json(value, default=None):

    if default is None:
        default = {}

    if not value:
        return default

    try:
        return json.loads(value)

    except Exception:
        return default


def row_dict(row):

    if row is None:
        return None

    return dict(row)


def contains(text, words):

    text = normalize_text(text)

    return any(
        word in text
        for word in words
    )


# =========================================================
# REQUEST MODELS
# =========================================================

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "User"


class LoginRequest(BaseModel):
    email: str
    password: str


class SkinProfileRequest(BaseModel):
    email: str
    age: Optional[int] = None
    skin_type: str = ""
    concern: str = ""
    sensitivity: str = ""


class LifestyleRequest(BaseModel):
    email: str
    water: str = ""
    sleep: str = ""
    exercise: str = ""


class AssessmentRequest(BaseModel):
    email: str


class ShareReportRequest(BaseModel):
    email: str
    assessment_id: Optional[int] = None
    dermatologist_name: str = ""


class IngredientAnalysisRequest(BaseModel):
    ingredient: str
    skin_type: str = ""
    sensitivity: str = ""


class IngredientInteractionRequest(BaseModel):
    ingredients: List[str] = []


class ProductRecommendationRequest(BaseModel):
    email: str
    skin_type: str = ""
    concern: str = ""
    budget: Optional[float] = None


class ProductCompareRequest(BaseModel):
    product_ids: List[int] = []


class RoutineTrackingRequest(BaseModel):
    email: str
    tracking_date: Optional[str] = None
    routine_type: Optional[str] = None
    completed: Optional[bool] = None
    morning_completed: Optional[bool] = None
    evening_completed: Optional[bool] = None
    notes: str = ""


class ProgressTrackingRequest(BaseModel):
    email: str
    date: Optional[str] = None
    score: float = 0
    concern: str = ""
    notes: str = ""


class DermatologistReviewRequest(BaseModel):
    report_id: int
    dermatologist_name: str = ""
    recommendation: str = ""


class ProfileUpdateRequest(BaseModel):
    email: str
    age: Optional[int] = None
    skin_type: str = ""
    concern: str = ""
    sensitivity: str = ""
    # =========================================================
# DEFAULT INGREDIENT DATABASE
# =========================================================

DEFAULT_INGREDIENTS = [

    {
        "name": "Salicylic Acid",
        "purpose":
            "Helps unclog pores and remove excess oil and dead skin cells.",
        "suitable_skin":
            "Oily, combination and acne-prone skin",
        "concerns":
            "Acne, blackheads, clogged pores, excess oil",
        "benefits":
            "Exfoliation, pore cleansing and oil control",
        "pros":
            "Useful for acne-prone and oily skin.",
        "cons":
            "May cause dryness or irritation if overused.",
        "irritation":
            "Possible dryness, stinging or peeling, especially on sensitive skin.",
        "allergy_warning":
            "Avoid if you have a known allergy to salicylates; stop use if a reaction occurs.",
        "interaction_notes":
            "Can increase irritation when combined with several strong exfoliating or retinoid products."
    },

    {
        "name": "Vitamin C",
        "purpose":
            "An antioxidant used to support brighter-looking and more even-toned skin.",
        "suitable_skin":
            "Most skin types; choose a gentle formulation for sensitive skin",
        "concerns":
            "Dullness, uneven tone and dark spots",
        "benefits":
            "Antioxidant support and brightening",
        "pros":
            "Can support a brighter, more even appearance.",
        "cons":
            "Some formulas may sting or irritate sensitive skin.",
        "irritation":
            "Possible stinging, redness or dryness.",
        "allergy_warning":
            "Check the complete product ingredient list for known allergens and stop if a reaction occurs.",
        "interaction_notes":
            "Usually compatible with sunscreen and many hydrating ingredients; avoid stacking multiple irritating actives if skin is sensitive."
    },

    {
        "name": "Niacinamide",
        "purpose":
            "Supports the skin barrier and can help with oil control and uneven appearance.",
        "suitable_skin":
            "Most skin types",
        "concerns":
            "Oiliness, uneven tone, barrier support",
        "benefits":
            "Barrier support and oil-control support",
        "pros":
            "Generally versatile and well tolerated.",
        "cons":
            "Higher concentrations may irritate some people.",
        "irritation":
            "Possible redness or tingling in sensitive skin.",
        "allergy_warning":
            "Stop use if you develop a suspected allergic reaction.",
        "interaction_notes":
            "Generally compatible with many skincare ingredients."
    },

    {
        "name": "Hyaluronic Acid",
        "purpose":
            "Humectant that helps attract and retain water in the skin.",
        "suitable_skin":
            "Dry, normal, combination and oily skin",
        "concerns":
            "Dryness and dehydration",
        "benefits":
            "Hydration and skin comfort",
        "pros":
            "Lightweight hydration support.",
        "cons":
            "Needs a suitable moisturizer and routine to reduce water loss.",
        "irritation":
            "Usually low, but any formula can contain irritating ingredients.",
        "allergy_warning":
            "Check the full formula for individual sensitivities.",
        "interaction_notes":
            "Generally compatible with most skincare ingredients."
    },

    {
        "name": "Retinol",
        "purpose":
            "A vitamin A derivative used in skincare to support cell turnover and improve the appearance of acne and uneven texture.",
        "suitable_skin":
            "Can be useful for acne and photoaging concerns; introduce cautiously",
        "concerns":
            "Acne, texture and signs of photoaging",
        "benefits":
            "Supports cell turnover and smoother-looking skin",
        "pros":
            "Evidence-supported topical active for several concerns.",
        "cons":
            "Can cause dryness, peeling and irritation, especially when starting.",
        "irritation":
            "Commonly causes dryness or irritation when introduced too quickly.",
        "allergy_warning":
            "Not an allergy diagnosis; stop and seek professional advice for significant reactions.",
        "interaction_notes":
            "Avoid combining several strong irritating actives in the same routine, especially when starting."
    },

    {
        "name": "Ceramides",
        "purpose":
            "Lipids that support the skin barrier and help reduce moisture loss.",
        "suitable_skin":
            "Most skin types, especially dry or sensitive skin",
        "concerns":
            "Dryness, sensitivity and barrier support",
        "benefits":
            "Barrier support and moisturization",
        "pros":
            "Useful for barrier-focused routines.",
        "cons":
            "Product texture may feel heavy for some oily-skin users.",
        "irritation":
            "Usually low; check the complete product formula.",
        "allergy_warning":
            "Check for sensitivity to other ingredients in the product.",
        "interaction_notes":
            "Generally compatible with active ingredients and helpful alongside them."
    },

    {
        "name": "AHA",
        "purpose":
            "Alpha hydroxy acids exfoliate the skin surface and can improve the appearance of texture and uneven tone.",
        "suitable_skin":
            "Normal, dry or sun-damaged skin when tolerated",
        "concerns":
            "Dullness, texture and uneven tone",
        "benefits":
            "Surface exfoliation and smoother appearance",
        "pros":
            "Can improve surface texture and brightness.",
        "cons":
            "May cause irritation and increased sun sensitivity.",
        "irritation":
            "Stinging, redness or peeling can occur.",
        "allergy_warning":
            "Stop use if a reaction occurs and check the full formula.",
        "interaction_notes":
            "Avoid over-layering with other strong exfoliants or retinoids if irritation occurs."
    },

    {
        "name": "BHA",
        "purpose":
            "Beta hydroxy acid, commonly salicylic acid, that helps exfoliate inside pores.",
        "suitable_skin":
            "Oily and acne-prone skin",
        "concerns":
            "Clogged pores, blackheads and excess oil",
        "benefits":
            "Pore-focused exfoliation",
        "pros":
            "Useful for oily and congested skin.",
        "cons":
            "Can dry or irritate skin.",
        "irritation":
            "Dryness, redness or peeling may occur.",
        "allergy_warning":
            "Check for known salicylate sensitivity.",
        "interaction_notes":
            "Avoid excessive use with multiple exfoliating actives."
    }
]


# =========================================================
# DEFAULT PRODUCT DATABASE
# =========================================================

DEFAULT_PRODUCTS = [

    {
        "name": "Salicylic Acid Face Wash",
        "brand": "SkinAI",
        "category": "Cleanser",
        "skin_type": "Oily, Combination",
        "concern": "Acne, Oiliness",
        "price": 299,
        "description": "Foaming cleanser for oily and acne-prone skin.",
        "ingredients": "Salicylic Acid"
    },

    {
        "name": "Gentle Hydrating Cleanser",
        "brand": "SkinAI",
        "category": "Cleanser",
        "skin_type": "Dry, Normal, Sensitive",
        "concern": "Dryness, Sensitivity",
        "price": 349,
        "description": "Gentle cleanser designed for a barrier-friendly routine.",
        "ingredients": "Ceramides, Glycerin"
    },

    {
        "name": "Vitamin C Brightening Serum",
        "brand": "SkinAI",
        "category": "Serum",
        "skin_type": "Normal, Combination, Dry",
        "concern": "Pigmentation, Dullness",
        "price": 499,
        "description": "Brightening serum for uneven-looking tone.",
        "ingredients": "Vitamin C"
    },

    {
        "name": "Niacinamide Serum",
        "brand": "SkinAI",
        "category": "Serum",
        "skin_type": "Oily, Combination, Normal",
        "concern": "Oiliness, Uneven Tone",
        "price": 399,
        "description": "Lightweight serum supporting barrier and oil control.",
        "ingredients": "Niacinamide"
    },

    {
        "name": "Hyaluronic Acid Hydrating Serum",
        "brand": "SkinAI",
        "category": "Serum",
        "skin_type": "Dry, Normal, Combination, Oily",
        "concern": "Dryness, Dehydration",
        "price": 449,
        "description": "Hydrating serum for dehydrated skin.",
        "ingredients": "Hyaluronic Acid"
    },

    {
        "name": "Ceramide Barrier Moisturizer",
        "brand": "SkinAI",
        "category": "Moisturizer",
        "skin_type": "Dry, Sensitive, Normal",
        "concern": "Dryness, Sensitivity",
        "price": 399,
        "description": "Barrier-focused moisturizer.",
        "ingredients": "Ceramides"
    },

    {
        "name": "Oil Control Moisturizer",
        "brand": "SkinAI",
        "category": "Moisturizer",
        "skin_type": "Oily, Combination",
        "concern": "Oiliness, Acne",
        "price": 329,
        "description": "Light moisturizer for oily and combination skin.",
        "ingredients": "Niacinamide"
    },

    {
        "name": "Retinol Night Serum",
        "brand": "SkinAI",
        "category": "Serum",
        "skin_type": "Normal, Combination, Oily",
        "concern": "Acne, Texture",
        "price": 599,
        "description": "Beginner-focused retinol night serum.",
        "ingredients": "Retinol"
    },

    {
        "name": "Daily Sunscreen SPF 50",
        "brand": "SkinAI",
        "category": "Sunscreen",
        "skin_type": "All",
        "concern": "Pigmentation, Sun Protection",
        "price": 499,
        "description": "Broad-spectrum daily sunscreen for routine use.",
        "ingredients": "UV Filters"
    },

    {
        "name": "Budget Daily Sunscreen SPF 30",
        "brand": "SkinAI",
        "category": "Sunscreen",
        "skin_type": "All",
        "concern": "Pigmentation, Sun Protection",
        "price": 249,
        "description": "Lower-cost daily sunscreen option.",
        "ingredients": "UV Filters"
    }
]


# =========================================================
# SEED INGREDIENTS
# =========================================================

def seed_ingredients():

    connection = get_connection()
    cursor = connection.cursor()

    for item in DEFAULT_INGREDIENTS:

        cursor.execute(
            """
            SELECT id
            FROM ingredients
            WHERE lower(name)=lower(?)
            """,
            (item["name"],)
        )

        if cursor.fetchone():
            continue

        cursor.execute(
            """
            INSERT OR IGNORE INTO ingredients
            (
                name,
                purpose,
                suitable_skin,
                concerns,
                benefits,
                pros,
                cons,
                irritation,
                allergy_warning,
                interaction_notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                item["name"],
                item["purpose"],
                item["suitable_skin"],
                item["concerns"],
                item["benefits"],
                item["pros"],
                item["cons"],
                item["irritation"],
                item["allergy_warning"],
                item["interaction_notes"]
            )
        )

    connection.commit()
    connection.close()


# =========================================================
# SEED PRODUCTS
# =========================================================

def seed_products():

    connection = get_connection()
    cursor = connection.cursor()

    for product in DEFAULT_PRODUCTS:

        cursor.execute(
            """
            SELECT id
            FROM products
            WHERE name=?
            """,
            (product["name"],)
        )

        existing = cursor.fetchone()

        if existing:
            continue

        cursor.execute(
            """
            INSERT OR IGNORE INTO products
            (
                name,
                brand,
                category,
                skin_type,
                concern,
                price,
                description,
                ingredients
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                product["name"],
                product.get("brand", "SkinAI"),
                product.get("category", ""),
                product.get("skin_type", ""),
                product.get("concern", ""),
                product.get("price", 0),
                product.get("description", ""),
                product.get("ingredients", "")
            )
        )

    connection.commit()
    connection.close()
  # =========================================================
# ASSESSMENT ENGINE
# =========================================================

def calculate_assessment(profile, lifestyle):

    skin_type = normalize_text(
        profile.get("skin_type")
    )

    concern = normalize_text(
        profile.get("concern")
    )

    sensitivity = normalize_text(
        profile.get("sensitivity")
    )

    # Concern scores
    acne = (
        25
        if contains(
            concern,
            ["acne", "pimple", "blackhead"]
        )
        else 8
    )

    pigmentation = (
        25
        if contains(
            concern,
            [
                "pigmentation",
                "dark",
                "spot",
                "uneven"
            ]
        )
        else 8
    )

    dryness = (
        25
        if (
            contains(
                concern,
                ["dry", "dehydr"]
            )
            or "dry" in skin_type
        )
        else 8
    )

    oiliness = (
        25
        if (
            contains(
                concern,
                ["oil", "sebum"]
            )
            or "oily" in skin_type
        )
        else 8
    )

    sensitivity_score = (
        25
        if contains(
            sensitivity,
            [
                "high",
                "sensitive",
                "yes"
            ]
        )
        else 8
    )


    # Risk factors
    risk_factors = []

    if contains(
        sensitivity,
        [
            "high",
            "sensitive",
            "yes"
        ]
    ):
        risk_factors.append(
            "Sensitive skin may have higher irritation risk."
        )

    sleep = normalize_text(
        lifestyle.get("sleep")
    )

    if sleep in [
        "low",
        "poor",
        "less than 6",
        "5",
        "4"
    ]:
        risk_factors.append(
            "Lower sleep may affect routine consistency and skin recovery."
        )

    water = normalize_text(
        lifestyle.get("water")
    )

    if water in [
        "low",
        "poor"
    ]:
        risk_factors.append(
            "Low water intake may contribute to dehydration."
        )

    exercise = normalize_text(
        lifestyle.get("exercise")
    )

    if exercise in [
        "low",
        "none",
        "no"
    ]:
        risk_factors.append(
            "Low activity is a lifestyle factor to monitor."
        )


    # Health score
    scores = [
        acne,
        pigmentation,
        dryness,
        oiliness,
        sensitivity_score
    ]

    health = max(
        0,
        min(
            100,
            round(
                100 -
                (
                    sum(scores) /
                    len(scores)
                ),
                1
            )
        )
    )


    # Priority concern
    priorities = [
        ("acne", acne),
        ("pigmentation", pigmentation),
        ("dryness", dryness),
        ("oiliness", oiliness),
        ("sensitivity", sensitivity_score)
    ]

    priority = max(
        priorities,
        key=lambda x: x[1]
    )[0]


    assessment_text = (
        f"AI assessment identifies "
        f"{priority} as the highest-priority area "
        f"based on the submitted profile. "
        f"This is a skincare planning score, "
        f"not a medical diagnosis."
    )


    recommendations = [
        "Use a gentle cleanser and moisturizer consistently.",
        "Use sunscreen during daytime, especially for pigmentation concerns.",
        "Introduce strong active ingredients gradually and monitor irritation."
    ]


    if "acne" in priority:

        recommendations.append(
            "Consider a salicylic-acid based routine if tolerated."
        )


    if "pigmentation" in priority:

        recommendations.append(
            "Consider a brightening routine with sunscreen and a suitable antioxidant."
        )


    if "dryness" in priority:

        recommendations.append(
            "Prioritize hydration and barrier-supporting ingredients."
        )


    if "sensitivity" in priority:

        recommendations.append(
            "Prefer a simple routine and patch-test new products."
        )


    return {
        "skin_health_score": health,
        "acne_score": acne,
        "pigmentation_score": pigmentation,
        "dryness_score": dryness,
        "oiliness_score": oiliness,
        "sensitivity_score": sensitivity_score,
        "risk_factors": risk_factors,
        "priority_concern": priority,
        "ai_assessment": assessment_text,
        "recommendations": recommendations
    }


# =========================================================
# PRODUCT SCORING
# =========================================================

def product_score(
    product,
    skin_type,
    concern
):

    product_skin = normalize_text(
        product["skin_type"]
    )

    product_concern = normalize_text(
        product["concern"]
    )

    score = 0


    # Skin type score
    if not skin_type:

        score += 1

    elif (
        "all" in product_skin
        or normalize_text(skin_type)
        in product_skin
    ):

        score += 5

    else:

        first_word = (
            normalize_text(skin_type)
            .split()[0]
            if normalize_text(skin_type)
            else ""
        )

        if (
            first_word
            and first_word in product_skin
        ):
            score += 3


    # Concern score
    if concern:

        concern_text = normalize_text(
            concern
        )

        if concern_text in product_concern:

            score += 5

        else:

            concern_words = (
                concern_text
                .replace(",", " ")
                .split()
            )

            if any(
                word
                and word in product_concern
                for word in concern_words
            ):
                score += 3


    return score


# =========================================================
# INITIALIZE DATABASE
# =========================================================

init_db()
seed_ingredients()
seed_products()


# =========================================================
# BASIC ENDPOINTS
# =========================================================

@app.get("/")
def root():

    return {
        "success": True,
        "message": "SkinAI API is running",
        "version": "3.0"
    }


@app.get("/health")
def health():

    return {
        "status": "ok",
        "database": os.path.exists(DB_PATH)
    }


# =========================================================
# REGISTER
# =========================================================

@app.post("/register")
def register(request: RegisterRequest):

    email = clean(
        request.email
    ).lower()

    if not email:

        raise HTTPException(
            status_code=400,
            detail="Email is required."
        )


    connection = get_connection()

    try:

        existing = connection.execute(
            """
            SELECT id
            FROM users
            WHERE lower(email)=?
            """,
            (email,)
        ).fetchone()


        if existing:

            return {
                "success": False,
                "message":
                    "Email already registered."
            }


        allowed_roles = [
            "User",
            "Dermatologist",
            "Consultant"
        ]

        role = (
            request.role
            if request.role in allowed_roles
            else "User"
        )


        cursor = connection.execute(
            """
            INSERT INTO users
            (
                name,
                email,
                password,
                role,
                created_at
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                clean(request.name),
                email,
                request.password,
                role,
                now_text()
            )
        )

        connection.commit()


        return {
            "success": True,
            "message":
                "Registration successful.",
            "user": {
                "id": cursor.lastrowid,
                "name":
                    clean(request.name),
                "email": email,
                "role": role
            }
        }

    finally:

        connection.close()


# =========================================================
# LOGIN
# =========================================================

@app.post("/login")
def login(request: LoginRequest):

    email = clean(
        request.email
    ).lower()

    connection = get_connection()

    try:

        row = connection.execute(
            """
            SELECT
                id,
                name,
                email,
                role
            FROM users
            WHERE lower(email)=?
            AND password=?
            """,
            (
                email,
                request.password
            )
        ).fetchone()


        if not row:

            return {
                "success": False,
                "message":
                    "Invalid email or password."
            }


        return {
            "success": True,
            "message":
                "Login successful.",
            "user":
                row_dict(row)
        }

    finally:

        connection.close()


# =========================================================
# SKIN PROFILE
# =========================================================

@app.post("/skin-profile")
def save_skin_profile(
    request: SkinProfileRequest
):

    connection = get_connection()

    try:

        email = request.email.lower()

        existing = connection.execute(
            """
            SELECT id
            FROM skin_profiles
            WHERE lower(email)=?
            """,
            (email,)
        ).fetchone()


        if existing:

            connection.execute(
                """
                UPDATE skin_profiles
                SET
                    age=?,
                    skin_type=?,
                    concern=?,
                    sensitivity=?,
                    updated_at=?
                WHERE lower(email)=?
                """,
                (
                    request.age,
                    request.skin_type,
                    request.concern,
                    request.sensitivity,
                    now_text(),
                    email
                )
            )

        else:

            connection.execute(
                """
                INSERT INTO skin_profiles
                (
                    email,
                    age,
                    skin_type,
                    concern,
                    sensitivity,
                    updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    email,
                    request.age,
                    request.skin_type,
                    request.concern,
                    request.sensitivity,
                    now_text()
                )
            )


        connection.commit()


        return {
            "success": True,
            "message":
                "Skin profile saved successfully."
        }

    finally:

        connection.close()


@app.get("/skin-profile/{email}")
def get_skin_profile(email: str):

    connection = get_connection()

    try:

        row = connection.execute(
            """
            SELECT *
            FROM skin_profiles
            WHERE lower(email)=?
            """,
            (email.lower(),)
        ).fetchone()


        return {
            "success": True,
            "profile":
                row_dict(row)
                if row
                else None
        }

    finally:

        connection.close()


# =========================================================
# UPDATE SKIN PROFILE
# =========================================================

@app.put("/skin-profile")
def update_skin_profile(
    request: ProfileUpdateRequest
):

    return save_skin_profile(
        SkinProfileRequest(
            email=request.email,
            age=request.age,
            skin_type=request.skin_type,
            concern=request.concern,
            sensitivity=request.sensitivity
        )
    )


# =========================================================
# LIFESTYLE
# =========================================================

@app.post("/lifestyle")
def save_lifestyle(
    request: LifestyleRequest
):

    connection = get_connection()

    try:

        email = request.email.lower()

        existing = connection.execute(
            """
            SELECT id
            FROM lifestyle
            WHERE lower(email)=?
            """,
            (email,)
        ).fetchone()


        if existing:

            connection.execute(
                """
                UPDATE lifestyle
                SET
                    water=?,
                    sleep=?,
                    exercise=?,
                    updated_at=?
                WHERE lower(email)=?
                """,
                (
                    request.water,
                    request.sleep,
                    request.exercise,
                    now_text(),
                    email
                )
            )

        else:

            connection.execute(
                """
                INSERT INTO lifestyle
                (
                    email,
                    water,
                    sleep,
                    exercise,
                    updated_at
                )
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    email,
                    request.water,
                    request.sleep,
                    request.exercise,
                    now_text()
                )
            )


        connection.commit()


        return {
            "success": True,
            "message":
                "Lifestyle data saved successfully."
        }

    finally:

        connection.close()


@app.get("/lifestyle/{email}")
def get_lifestyle(email: str):

    connection = get_connection()

    try:

        row = connection.execute(
            """
            SELECT *
            FROM lifestyle
            WHERE lower(email)=?
            """,
            (email.lower(),)
        ).fetchone()


        return {
            "success": True,
            "lifestyle":
                row_dict(row)
                if row
                else None
        }

    finally:

        connection.close()
        # =========================================================
# AI ASSESSMENT
# =========================================================

@app.post("/assessment")
def create_assessment(
    request: AssessmentRequest
):

    connection = get_connection()

    try:

        profile_row = connection.execute(
            """
            SELECT *
            FROM skin_profiles
            WHERE lower(email)=?
            """,
            (request.email.lower(),)
        ).fetchone()


        lifestyle_row = connection.execute(
            """
            SELECT *
            FROM lifestyle
            WHERE lower(email)=?
            """,
            (request.email.lower(),)
        ).fetchone()


        if not profile_row:

            return {
                "success": False,
                "message":
                    "Please complete Skin Profile first."
            }


        profile = row_dict(
            profile_row
        )

        lifestyle = (
            row_dict(lifestyle_row)
            if lifestyle_row
            else {}
        )


        result = calculate_assessment(
            profile,
            lifestyle
        )


        cursor = connection.execute(
            """
            INSERT INTO assessments
            (
                email,
                skin_health_score,
                acne_score,
                pigmentation_score,
                dryness_score,
                oiliness_score,
                sensitivity_score,
                risk_factors,
                priority_concern,
                ai_assessment,
                recommendations,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                request.email.lower(),
                result["skin_health_score"],
                result["acne_score"],
                result["pigmentation_score"],
                result["dryness_score"],
                result["oiliness_score"],
                result["sensitivity_score"],
                json.dumps(
                    result["risk_factors"]
                ),
                result["priority_concern"],
                result["ai_assessment"],
                json.dumps(
                    result["recommendations"]
                ),
                now_text()
            )
        )


        connection.commit()


        return {
            "success": True,
            "assessment_id":
                cursor.lastrowid,
            "assessment":
                result
        }

    finally:

        connection.close()


@app.get("/assessment/{email}")
def get_assessment(email: str):

    connection = get_connection()

    try:

        row = connection.execute(
            """
            SELECT *
            FROM assessments
            WHERE lower(email)=?
            ORDER BY id DESC
            LIMIT 1
            """,
            (email.lower(),)
        ).fetchone()


        if not row:

            return {
                "success": True,
                "assessment": None
            }


        data = row_dict(row)


        data["risk_factors"] = parse_json(
            data.get("risk_factors"),
            []
        )

        data["recommendations"] = parse_json(
            data.get("recommendations"),
            []
        )


        return {
            "success": True,
            "assessment": data
        }

    finally:

        connection.close()


@app.get("/assessments")
def get_all_assessments():

    connection = get_connection()

    try:

        rows = connection.execute(
            """
            SELECT
                a.*,
                u.name,
                u.email
            FROM assessments a
            LEFT JOIN users u
                ON lower(u.email)=lower(a.email)
            ORDER BY a.id DESC
            """
        ).fetchall()


        result = []


        for row in rows:

            item = row_dict(row)

            item["risk_factors"] = parse_json(
                item.get("risk_factors"),
                []
            )

            item["recommendations"] = parse_json(
                item.get("recommendations"),
                []
            )

            result.append(item)


        return {
            "success": True,
            "assessments": result
        }

    finally:

        connection.close()


# =========================================================
# SHARE REPORT
# =========================================================

@app.post("/share-report")
def share_report(
    request: ShareReportRequest
):

    connection = get_connection()

    try:

        assessment = None


        if request.assessment_id:

            assessment = connection.execute(
                """
                SELECT *
                FROM assessments
                WHERE id=?
                AND lower(email)=?
                """,
                (
                    request.assessment_id,
                    request.email.lower()
                )
            ).fetchone()


        if not assessment:

            assessment = connection.execute(
                """
                SELECT *
                FROM assessments
                WHERE lower(email)=?
                ORDER BY id DESC
                LIMIT 1
                """,
                (request.email.lower(),)
            ).fetchone()


        if not assessment:

            return {
                "success": False,
                "message":
                    "No assessment report found."
            }


        user = connection.execute(
            """
            SELECT name
            FROM users
            WHERE lower(email)=?
            """,
            (request.email.lower(),)
        ).fetchone()


        cursor = connection.execute(
            """
            INSERT INTO shared_reports
            (
                email,
                user_name,
                assessment_id,
                status,
                dermatologist_name,
                shared_at
            )
            VALUES (?, ?, ?, 'Shared', ?, ?)
            """,
            (
                request.email.lower(),
                user["name"]
                if user
                else "",
                assessment["id"],
                request.dermatologist_name,
                now_text()
            )
        )


        connection.commit()


        return {
            "success": True,
            "report_id":
                cursor.lastrowid,
            "message":
                "Report shared successfully."
        }

    finally:

        connection.close()


# =========================================================
# SHARED REPORT
# =========================================================

@app.get("/shared-report/{report_id}")
def get_shared_report(
    report_id: int
):

    connection = get_connection()

    try:

        row = connection.execute(
            """
            SELECT
                sr.*,
                a.skin_health_score,
                a.acne_score,
                a.pigmentation_score,
                a.dryness_score,
                a.oiliness_score,
                a.sensitivity_score,
                a.risk_factors,
                a.priority_concern,
                a.ai_assessment,
                a.recommendations,
                a.created_at AS assessment_created_at
            FROM shared_reports sr
            LEFT JOIN assessments a
                ON a.id=sr.assessment_id
            WHERE sr.id=?
            """,
            (report_id,)
        ).fetchone()


        if not row:

            raise HTTPException(
                status_code=404,
                detail="Shared report not found."
            )


        data = row_dict(row)


        data["risk_factors"] = parse_json(
            data.get("risk_factors"),
            []
        )

        data["recommendations"] = parse_json(
            data.get("recommendations"),
            []
        )


        return {
            "success": True,
            "report": data
        }

    finally:

        connection.close()


# =========================================================
# INGREDIENT INTELLIGENCE
# =========================================================

@app.get("/ingredients")
def get_ingredients():

    connection = get_connection()

    try:

        rows = connection.execute(
            """
            SELECT *
            FROM ingredients
            ORDER BY name
            """
        ).fetchall()


        return {
            "success": True,
            "ingredients": [
                row_dict(row)
                for row in rows
            ]
        }

    finally:

        connection.close()


@app.post("/ingredient-analysis")
def ingredient_analysis(
    request: IngredientAnalysisRequest
):

    connection = get_connection()

    try:

        ingredient_name = clean(
            request.ingredient
        )


        row = connection.execute(
            """
            SELECT *
            FROM ingredients
            WHERE lower(name)=lower(?)
            """,
            (ingredient_name,)
        ).fetchone()


        if not row:

            row = connection.execute(
                """
                SELECT *
                FROM ingredients
                WHERE lower(name) LIKE ?
                """,
                (
                    "%"
                    + normalize_text(
                        ingredient_name
                    )
                    + "%"
                ,)
            ).fetchone()


        if not row:

            return {
                "success": False,
                "message":
                    "Ingredient not found in SkinAI ingredient database."
            }


        data = row_dict(row)


        skin = normalize_text(
            request.skin_type
        )

        suitable = normalize_text(
            data["suitable_skin"]
        )


        sensitivity_warning = ""


        if (
            skin
            and skin not in suitable
            and "most" not in suitable
            and "all" not in suitable
        ):

            sensitivity_warning = (
                "Suitability may vary for this skin type; "
                "introduce cautiously."
            )


        if contains(
            request.sensitivity,
            [
                "high",
                "sensitive",
                "yes"
            ]
        ):

            sensitivity_warning = (
                "Because sensitivity is reported, "
                "patch-test and introduce this active gradually."
            )


        data["sensitivity_warning"] = (
            sensitivity_warning
        )


        data["allergy_warning"] = (
            data.get("allergy_warning")
            or
            "Check the complete product formula for known allergens."
        )


        return {
            "success": True,
            "analysis": data
        }

    finally:

        connection.close()


# =========================================================
# INGREDIENT INTERACTION
# =========================================================

def interaction_for_pair(
    ingredient_a,
    ingredient_b
):

    pair = {
        normalize_text(ingredient_a),
        normalize_text(ingredient_b)
    }


    if pair == {
        "salicylic acid",
        "retinol"
    }:

        return (
            "Both can be irritating when layered; "
            "consider separating them, especially for sensitive skin."
        )


    if (
        "aha" in pair
        and "retinol" in pair
    ):

        return (
            "Both may increase irritation; "
            "avoid layering if your skin is sensitive."
        )


    if (
        "bha" in pair
        and "retinol" in pair
    ):

        return (
            "BHA and retinol may be irritating together; "
            "introduce carefully or separate routines."
        )


    if (
        "vitamin c" in pair
        and "retinol" in pair
    ):

        return (
            "They can be used in a broader routine, "
            "but layering may increase irritation for some users."
        )


    if (
        "vitamin c" in pair
        and (
            "aha" in pair
            or "bha" in pair
            or "salicylic acid" in pair
        )
    ):

        return (
            "Multiple active acids can increase irritation; "
            "use a simple routine if sensitivity occurs."
        )


    return (
        "No major routine conflict is identified in this "
        "SkinAI rule set; individual tolerance can vary."
    )


@app.post("/ingredient-interaction")
def ingredient_interaction(
    request: IngredientInteractionRequest
):

    names = [
        clean(item)
        for item in request.ingredients
        if clean(item)
    ]


    warnings = []


    if len(names) >= 2:

        for i in range(len(names)):

            for j in range(
                i + 1,
                len(names)
            ):

                note = interaction_for_pair(
                    names[i],
                    names[j]
                )


                if "No major" not in note:

                    warnings.append(
                        {
                            "ingredients": [
                                names[i],
                                names[j]
                            ],
                            "message": note
                        }
                    )


    return {
        "success": True,
        "ingredients": names,
        "compatible":
            len(warnings) == 0,
        "interactions":
            warnings,
        "message":
            (
                "No major interaction rule triggered."
                if not warnings
                else
                "Potential irritation interaction(s) detected."
            )
    }
    # =========================================================
# PRODUCTS
# =========================================================

@app.get("/products")
def get_products():

    connection = get_connection()

    try:

        rows = connection.execute(
            """
            SELECT *
            FROM products
            ORDER BY price, name
            """
        ).fetchall()


        return {
            "success": True,
            "products": [
                row_dict(row)
                for row in rows
            ]
        }

    finally:

        connection.close()


@app.get("/products/{product_id}")
def get_product(product_id: int):

    connection = get_connection()

    try:

        row = connection.execute(
            """
            SELECT *
            FROM products
            WHERE id=?
            """,
            (product_id,)
        ).fetchone()


        if not row:

            raise HTTPException(
                status_code=404,
                detail="Product not found."
            )


        return {
            "success": True,
            "product": row_dict(row)
        }

    finally:

        connection.close()


# =========================================================
# PRODUCT RECOMMENDATIONS
# =========================================================

@app.post("/product-recommendations")
def product_recommendations(
    request: ProductRecommendationRequest
):

    connection = get_connection()

    try:

        skin_type = clean(
            request.skin_type
        )

        concern = clean(
            request.concern
        )


        # If frontend does not send these,
        # get them from saved profile.

        if not skin_type or not concern:

            profile = connection.execute(
                """
                SELECT *
                FROM skin_profiles
                WHERE lower(email)=?
                """,
                (request.email.lower(),)
            ).fetchone()


            if profile:

                skin_type = (
                    skin_type
                    or profile["skin_type"]
                )

                concern = (
                    concern
                    or profile["concern"]
                )


        rows = connection.execute(
            """
            SELECT *
            FROM products
            """
        ).fetchall()


        scored = []


        for row in rows:

            product = row_dict(row)

            score = product_score(
                product,
                skin_type,
                concern
            )


            if (
                request.budget is not None
                and
                float(
                    product["price"] or 0
                )
                <= float(request.budget)
            ):

                score += 2


            scored.append(
                (
                    score,
                    product
                )
            )


        scored.sort(
            key=lambda item: (
                -item[0],
                float(
                    item[1]["price"] or 0
                )
            )
        )


        filtered = [
            product
            for score, product
            in scored
            if (
                request.budget is None
                or
                float(
                    product["price"] or 0
                )
                <= float(request.budget)
            )
        ]


        if not filtered:

            filtered = [
                product
                for score, product
                in scored[:5]
            ]


        return {
            "success": True,
            "skin_type": skin_type,
            "concern": concern,
            "budget": request.budget,
            "recommendations":
                filtered[:6]
        }

    finally:

        connection.close()


# =========================================================
# PRODUCT COMPARISON
# =========================================================

@app.post("/product-compare")
def product_compare(
    request: ProductCompareRequest
):

    if not request.product_ids:

        return {
            "success": False,
            "message":
                "Select products to compare."
        }


    connection = get_connection()

    try:

        placeholders = ",".join(
            "?"
            for _ in request.product_ids
        )


        rows = connection.execute(
            f"""
            SELECT *
            FROM products
            WHERE id IN ({placeholders})
            """,
            tuple(request.product_ids)
        ).fetchall()


        return {
            "success": True,
            "products": [
                row_dict(row)
                for row in rows
            ]
        }

    finally:

        connection.close()


# =========================================================
# PERSONALIZED PRODUCTS
# =========================================================

@app.get("/personalized-products/{email}")
def personalized_products(
    email: str
):

    connection = get_connection()

    try:

        profile = connection.execute(
            """
            SELECT *
            FROM skin_profiles
            WHERE lower(email)=?
            """,
            (email.lower(),)
        ).fetchone()


        if not profile:

            return {
                "success": True,
                "recommendations": []
            }


        request = ProductRecommendationRequest(
            email=email,
            skin_type=profile["skin_type"],
            concern=profile["concern"],
            budget=None
        )


        return product_recommendations(
            request
        )

    finally:

        connection.close()


# =========================================================
# ROUTINE TRACKING
# =========================================================

def save_routine_legacy(
    connection,
    request
):

    tracking_date = (
        request.tracking_date
        or date.today().isoformat()
    )

    routine_type = (
        request.routine_type
        or "morning"
    )

    completed = (
        1
        if request.completed
        else 0
    )


    morning = (
        completed
        if routine_type.lower()
        == "morning"
        else 0
    )

    evening = (
        completed
        if routine_type.lower()
        == "evening"
        else 0
    )


    existing = connection.execute(
        """
        SELECT id
        FROM routine_tracking
        WHERE lower(email)=?
        AND tracking_date=?
        AND routine_type=?
        """,
        (
            request.email.lower(),
            tracking_date,
            routine_type
        )
    ).fetchone()


    if existing:

        connection.execute(
            """
            UPDATE routine_tracking
            SET
                completed=?,
                morning_completed=?,
                evening_completed=?,
                notes=?
            WHERE id=?
            """,
            (
                completed,
                morning,
                evening,
                request.notes,
                existing["id"]
            )
        )

    else:

        connection.execute(
            """
            INSERT INTO routine_tracking
            (
                email,
                tracking_date,
                routine_type,
                completed,
                morning_completed,
                evening_completed,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                request.email.lower(),
                tracking_date,
                routine_type,
                completed,
                morning,
                evening,
                request.notes
            )
        )


@app.post("/routine-tracking")
def save_routine_tracking(
    request: RoutineTrackingRequest
):

    connection = get_connection()

    try:

        tracking_date = (
            request.tracking_date
            or date.today().isoformat()
        )


        # Old frontend format
        if (
            request.routine_type
            and
            request.completed is not None
        ):

            save_routine_legacy(
                connection,
                request
            )


        # New Milestone 3 format
        else:

            routine_type = "daily"


            existing = connection.execute(
                """
                SELECT id
                FROM routine_tracking
                WHERE lower(email)=?
                AND tracking_date=?
                AND routine_type=?
                """,
                (
                    request.email.lower(),
                    tracking_date,
                    routine_type
                )
            ).fetchone()


            morning = (
                1
                if request.morning_completed
                else 0
            )

            evening = (
                1
                if request.evening_completed
                else 0
            )

            completed = (
                1
                if morning and evening
                else 0
            )


            if existing:

                connection.execute(
                    """
                    UPDATE routine_tracking
                    SET
                        completed=?,
                        morning_completed=?,
                        evening_completed=?,
                        notes=?
                    WHERE id=?
                    """,
                    (
                        completed,
                        morning,
                        evening,
                        request.notes,
                        existing["id"]
                    )
                )

            else:

                connection.execute(
                    """
                    INSERT INTO routine_tracking
                    (
                        email,
                        tracking_date,
                        routine_type,
                        completed,
                        morning_completed,
                        evening_completed,
                        notes
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        request.email.lower(),
                        tracking_date,
                        routine_type,
                        completed,
                        morning,
                        evening,
                        request.notes
                    )
                )


        connection.commit()


        return {
            "success": True,
            "message":
                "Routine tracking saved."
        }

    finally:

        connection.close()


@app.get("/routine-tracking/{email}")
def get_routine_tracking(
    email: str
):

    connection = get_connection()

    try:

        rows = connection.execute(
            """
            SELECT *
            FROM routine_tracking
            WHERE lower(email)=?
            ORDER BY
                tracking_date DESC,
                id DESC
            """,
            (email.lower(),)
        ).fetchall()


        records = [
            row_dict(row)
            for row in rows
        ]


        return {
            "success": True,
            "tracking": records,
            "records": records
        }

    finally:

        connection.close()
        # =========================================================
# PROGRESS TRACKING
# =========================================================

@app.post("/progress-tracking")
def save_progress_tracking(
    request: ProgressTrackingRequest
):

    connection = get_connection()

    try:

        progress_date = (
            request.date
            or date.today().isoformat()
        )


        connection.execute(
            """
            INSERT INTO progress_tracking
            (
                email,
                date,
                score,
                concern,
                notes,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                request.email.lower(),
                progress_date,
                request.score,
                request.concern,
                request.notes,
                now_text()
            )
        )


        connection.commit()


        return {
            "success": True,
            "message":
                "Progress saved successfully."
        }

    finally:

        connection.close()


@app.get("/progress-tracking/{email}")
def get_progress_tracking(
    email: str
):

    connection = get_connection()

    try:

        rows = connection.execute(
            """
            SELECT *
            FROM progress_tracking
            WHERE lower(email)=?
            ORDER BY date ASC, id ASC
            """,
            (email.lower(),)
        ).fetchall()


        records = [
            row_dict(row)
            for row in rows
        ]


        return {
            "success": True,
            "progress": records,
            "records": records
        }

    finally:

        connection.close()


# =========================================================
# PROGRESS ANALYSIS
# =========================================================

@app.get("/progress-analysis/{email}")
def progress_analysis(
    email: str
):

    connection = get_connection()

    try:

        rows = connection.execute(
            """
            SELECT *
            FROM progress_tracking
            WHERE lower(email)=?
            ORDER BY date ASC, id ASC
            """,
            (email.lower(),)
        ).fetchall()


        records = [
            row_dict(row)
            for row in rows
        ]


        if not records:

            return {
                "success": True,
                "count": 0,
                "adherence": 0,
                "change": 0,
                "trend": "No data",
                "progress": []
            }


        scores = [
            float(
                row["score"] or 0
            )
            for row in rows
        ]


        change = round(
            scores[-1] - scores[0],
            1
        )


        if change > 0:

            trend = "Improving"

        elif change < 0:

            trend = "Declining"

        else:

            trend = "Stable"


        # Routine adherence
        routine_rows = connection.execute(
            """
            SELECT
                morning_completed,
                evening_completed
            FROM routine_tracking
            WHERE lower(email)=?
            """,
            (email.lower(),)
        ).fetchall()


        adherence = 0


        if routine_rows:

            total = (
                len(routine_rows)
                * 2
            )


            completed = sum(
                int(
                    row["morning_completed"]
                    or 0
                )
                +
                int(
                    row["evening_completed"]
                    or 0
                )
                for row in routine_rows
            )


            if total:

                adherence = round(
                    (
                        completed /
                        total
                    ) * 100,
                    1
                )


        return {
            "success": True,
            "count": len(records),
            "adherence": adherence,
            "change": change,
            "trend": trend,
            "start_score": scores[0],
            "latest_score": scores[-1],
            "progress": records
        }

    finally:

        connection.close()


# =========================================================
# DASHBOARD
# =========================================================

@app.get("/dashboard/{email}")
def dashboard(
    email: str
):

    connection = get_connection()

    try:

        user = connection.execute(
            """
            SELECT
                id,
                name,
                email,
                role
            FROM users
            WHERE lower(email)=?
            """,
            (email.lower(),)
        ).fetchone()


        profile = connection.execute(
            """
            SELECT *
            FROM skin_profiles
            WHERE lower(email)=?
            """,
            (email.lower(),)
        ).fetchone()


        lifestyle = connection.execute(
            """
            SELECT *
            FROM lifestyle
            WHERE lower(email)=?
            """,
            (email.lower(),)
        ).fetchone()


        assessment = connection.execute(
            """
            SELECT *
            FROM assessments
            WHERE lower(email)=?
            ORDER BY id DESC
            LIMIT 1
            """,
            (email.lower(),)
        ).fetchone()


        assessment_data = (
            row_dict(assessment)
            if assessment
            else None
        )


        if assessment_data:

            assessment_data[
                "risk_factors"
            ] = parse_json(
                assessment_data.get(
                    "risk_factors"
                ),
                []
            )


            assessment_data[
                "recommendations"
            ] = parse_json(
                assessment_data.get(
                    "recommendations"
                ),
                []
            )


        products = []


        if profile:

            rows = connection.execute(
                """
                SELECT *
                FROM products
                """
            ).fetchall()


            scored = []


            for row in rows:

                product = row_dict(row)

                score = product_score(
                    product,
                    profile["skin_type"],
                    profile["concern"]
                )


                scored.append(
                    (
                        score,
                        product
                    )
                )


            scored.sort(
                key=lambda item: (
                    -item[0],
                    float(
                        item[1]["price"]
                        or 0
                    )
                )
            )


            products = [
                product
                for score, product
                in scored[:6]
            ]


        return {
            "success": True,

            "user":
                row_dict(user)
                if user
                else None,

            "profile":
                row_dict(profile)
                if profile
                else None,

            "lifestyle":
                row_dict(lifestyle)
                if lifestyle
                else None,

            "assessment":
                assessment_data,

            "products":
                products
        }

    finally:

        connection.close()


# =========================================================
# DATABASE STATUS
# =========================================================

@app.get("/database-status")
def database_status():

    connection = get_connection()

    try:

        tables = [
            "users",
            "skin_profiles",
            "lifestyle",
            "assessments",
            "shared_reports",
            "ingredients",
            "products",
            "routine_tracking",
            "progress_tracking"
        ]


        result = {}


        for table in tables:

            count = connection.execute(
                f"""
                SELECT COUNT(*) AS c
                FROM {table}
                """
            ).fetchone()["c"]


            result[table] = count


        return {
            "success": True,
            "database": DB_PATH,
            "tables": result
        }

    finally:

        connection.close()


# =========================================================
# DERMATOLOGIST REPORTS
# =========================================================

@app.get("/dermatologist-reports")
def dermatologist_reports():

    connection = get_connection()

    try:

        rows = connection.execute(
            """
            SELECT
                sr.*,
                a.skin_health_score,
                a.priority_concern,
                a.ai_assessment,
                a.recommendations,
                a.created_at AS assessment_created_at
            FROM shared_reports sr
            LEFT JOIN assessments a
                ON a.id=sr.assessment_id
            ORDER BY sr.id DESC
            """
        ).fetchall()


        reports = []


        for row in rows:

            item = row_dict(row)


            item["recommendations"] = parse_json(
                item.get("recommendations"),
                []
            )


            reports.append(item)


        return {
            "success": True,
            "reports": reports
        }

    finally:

        connection.close()


# =========================================================
# DERMATOLOGIST REVIEW
# =========================================================

@app.post("/dermatologist-review")
def dermatologist_review(
    request: DermatologistReviewRequest
):

    connection = get_connection()

    try:

        existing = connection.execute(
            """
            SELECT id
            FROM shared_reports
            WHERE id=?
            """,
            (request.report_id,)
        ).fetchone()


        if not existing:

            raise HTTPException(
                status_code=404,
                detail="Report not found."
            )


        connection.execute(
            """
            UPDATE shared_reports
            SET
                status='Reviewed',
                dermatologist_name=?,
                dermatologist_recommendation=?,
                reviewed_at=?
            WHERE id=?
            """,
            (
                request.dermatologist_name,
                request.recommendation,
                now_text(),
                request.report_id
            )
        )


        connection.commit()


        return {
            "success": True,
            "message":
                "Dermatologist recommendation saved."
        }

    finally:

        connection.close()


# =========================================================
# USER SHARED REPORTS
# =========================================================

@app.get("/user-reports/{email}")
def user_reports(
    email: str
):

    connection = get_connection()

    try:

        rows = connection.execute(
            """
            SELECT
                sr.*,
                a.skin_health_score,
                a.priority_concern,
                a.ai_assessment,
                a.recommendations,
                a.created_at AS assessment_created_at
            FROM shared_reports sr
            LEFT JOIN assessments a
                ON a.id=sr.assessment_id
            WHERE lower(sr.email)=?
            ORDER BY sr.id DESC
            """,
            (email.lower(),)
        ).fetchall()


        reports = []


        for row in rows:

            item = row_dict(row)


            item["recommendations"] = parse_json(
                item.get("recommendations"),
                []
            )


            reports.append(item)


        return {
            "success": True,
            "reports": reports
        }

    finally:

        connection.close()


# =========================================================
# OPTIONAL RECOMMENDATIONS ALIAS
# =========================================================

@app.get("/recommendations/{email}")
def recommendations_alias(
    email: str
):

    return personalized_products(
        email
    )


# =========================================================
# SERVER
# =========================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )  