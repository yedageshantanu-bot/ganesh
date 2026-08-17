export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const showAll = url.searchParams.get('all') === 'true';

  try {
    let results;
    if (env.DB) {
      if (showAll) {
        const query = await env.DB.prepare("SELECT * FROM traveler_messages ORDER BY created_at DESC").all();
        results = query.results || [];
      } else {
        const query = await env.DB.prepare("SELECT * FROM traveler_messages WHERE approved = 1 ORDER BY created_at DESC").all();
        results = query.results || [];
      }
      
      // Format approved column as boolean for frontend compatibility
      results = results.map(r => ({
        ...r,
        approved: r.approved === 1 || r.approved === true
      }));
    } else {
      results = [];
    }

    return new Response(JSON.stringify(results), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();
    const { full_name, city_country, message } = data;

    if (!full_name || !message) {
      return new Response(JSON.stringify({ error: 'Name and message are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const id = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const createdAt = new Date().toISOString();

    if (env.DB) {
      await env.DB.prepare(
        "INSERT INTO traveler_messages (id, full_name, city_country, message, approved, created_at) VALUES (?, ?, ?, ?, 0, ?)"
      ).bind(id, full_name.trim(), (city_country || '').trim() || null, message.trim(), createdAt).run();
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Reflection submitted for admin approval',
      data: { id, full_name, city_country, message, approved: false, created_at: createdAt }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
