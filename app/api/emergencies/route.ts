import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Remove patient_unique_id field
    const { patient_unique_id, ...emergencyData } = data;
    
    // Insert the emergency into the emergencies table
    const { data: emergency, error } = await supabase
      .from('emergencies')
      .insert([{
        emergency_type: emergencyData.emergency_type,
        location: emergencyData.location,
        latitude: emergencyData.latitude,
        longitude: emergencyData.longitude,
        description: emergencyData.description,
        reporter_name: emergencyData.reporter_name,
        contact_number: emergencyData.contact_number,
        requires_ambulance: emergencyData.requires_ambulance || false,
        status: 'pending'
        // No patient_unique_id field
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating emergency:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create emergency: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: emergency });
  } catch (error) {
    console.error('Error processing emergency:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process emergency' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data: emergencies, error } = await supabase
      .from('emergencies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching emergencies:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch emergencies' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: emergencies });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    const { data: emergency, error } = await supabase
      .from('emergencies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating emergency:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update emergency' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: emergency });
  } catch (error) {
    console.error('Error processing update:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process update' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Emergency ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('emergencies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting emergency:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete emergency' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing deletion:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process deletion' },
      { status: 500 }
    );
  }
} 