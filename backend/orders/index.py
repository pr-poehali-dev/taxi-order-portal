import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для управления заказами такси'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            order_id = event.get('queryStringParameters', {}).get('id')
            
            if order_id:
                cur.execute("""
                    SELECT o.id, o.passenger_name, o.passenger_phone, o.from_address, 
                           o.to_address, o.price, o.status, o.rating, o.created_at,
                           d.name as driver_name, d.car_model, d.car_number
                    FROM orders o
                    LEFT JOIN drivers d ON o.driver_id = d.id
                    WHERE o.id = %s
                """, (order_id,))
                row = cur.fetchone()
                
                if row:
                    result = {
                        'id': row[0],
                        'passenger_name': row[1],
                        'passenger_phone': row[2],
                        'from_address': row[3],
                        'to_address': row[4],
                        'price': float(row[5]) if row[5] else None,
                        'status': row[6],
                        'rating': row[7],
                        'created_at': row[8].isoformat() if row[8] else None,
                        'driver': {
                            'name': row[9],
                            'car_model': row[10],
                            'car_number': row[11]
                        } if row[9] else None
                    }
                    return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps(result), 'isBase64Encoded': False}
                
                return {'statusCode': 404, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Order not found'}), 'isBase64Encoded': False}
            
            cur.execute("""
                SELECT o.id, o.passenger_name, o.from_address, o.to_address, 
                       o.price, o.status, o.created_at,
                       d.name as driver_name
                FROM orders o
                LEFT JOIN drivers d ON o.driver_id = d.id
                ORDER BY o.created_at DESC
                LIMIT 50
            """)
            
            orders = []
            for row in cur.fetchall():
                orders.append({
                    'id': row[0],
                    'passenger_name': row[1],
                    'from_address': row[2],
                    'to_address': row[3],
                    'price': float(row[4]) if row[4] else None,
                    'status': row[5],
                    'created_at': row[6].isoformat() if row[6] else None,
                    'driver_name': row[7]
                })
            
            return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps(orders), 'isBase64Encoded': False}
        
        elif method == 'POST':
            data = json.loads(event.get('body', '{}'))
            
            cur.execute("""
                INSERT INTO orders (
                    driver_id, passenger_name, passenger_phone, 
                    from_address, to_address, from_latitude, from_longitude,
                    to_latitude, to_longitude, price, status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending')
                RETURNING id
            """, (
                data.get('driver_id'),
                data.get('passenger_name'),
                data.get('passenger_phone'),
                data.get('from_address'),
                data.get('to_address'),
                data.get('from_latitude'),
                data.get('from_longitude'),
                data.get('to_latitude'),
                data.get('to_longitude'),
                data.get('price')
            ))
            
            order_id = cur.fetchone()[0]
            conn.commit()
            
            return {'statusCode': 201, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'id': order_id, 'status': 'pending'}), 'isBase64Encoded': False}
        
        elif method == 'PUT':
            data = json.loads(event.get('body', '{}'))
            order_id = data.get('id')
            
            if not order_id:
                return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Order ID required'}), 'isBase64Encoded': False}
            
            updates = []
            params = []
            
            if 'status' in data:
                updates.append('status = %s')
                params.append(data['status'])
            
            if 'rating' in data:
                updates.append('rating = %s')
                params.append(data['rating'])
            
            if data.get('status') == 'completed':
                updates.append('completed_at = %s')
                params.append(datetime.now())
            
            params.append(order_id)
            
            cur.execute(f"""
                UPDATE orders 
                SET {', '.join(updates)}
                WHERE id = %s
            """, params)
            
            conn.commit()
            
            return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True}), 'isBase64Encoded': False}
        
        return {'statusCode': 405, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'}), 'isBase64Encoded': False}
    
    finally:
        cur.close()
        conn.close()
