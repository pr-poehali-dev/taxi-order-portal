import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для получения списка доступных водителей'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {'statusCode': 405, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'}), 'isBase64Encoded': False}
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        cur.execute("""
            SELECT id, name, phone, car_model, car_number, rating, 
                   latitude, longitude, is_active
            FROM drivers
            WHERE is_active = true
            ORDER BY rating DESC
        """)
        
        drivers = []
        for row in cur.fetchall():
            drivers.append({
                'id': row[0],
                'name': row[1],
                'phone': row[2],
                'car': row[3],
                'car_number': row[4],
                'rating': float(row[5]) if row[5] else 5.0,
                'coords': [float(row[6]), float(row[7])] if row[6] and row[7] else None,
                'is_active': row[8]
            })
        
        return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps(drivers), 'isBase64Encoded': False}
    
    finally:
        cur.close()
        conn.close()
