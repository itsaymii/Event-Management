from django.core.management.base import BaseCommand
from dashboard.models import Equipment

class Command(BaseCommand):
    help = 'Populate sample equipment data for testing'

    def handle(self, *args, **options):
        # Sample equipment data
        equipment_list = [
            {
                'equipment_id': 'AUD-001',
                'equipment_name': 'Microphone (Shure SM7B)',
                'description': 'Professional condenser microphone for vocals and instruments',
                'category': 'Audio',
                'status': 'available',
                'condition': 'excellent',
                'quantity_total': 3,
            },
            {
                'equipment_id': 'AUD-002',
                'equipment_name': 'Speaker (JBL SRX812P)',
                'description': 'High-powered PA speaker system',
                'category': 'Audio',
                'status': 'available',
                'condition': 'excellent',
                'quantity_total': 4,
            },
            {
                'equipment_id': 'AUD-003',
                'equipment_name': 'Mixing Desk (Soundcraft UI24)',
                'description': '24-channel digital mixing console',
                'category': 'Audio',
                'status': 'available',
                'condition': 'good',
                'quantity_total': 2,
            },
            {
                'equipment_id': 'VID-001',
                'equipment_name': 'Projector (Epson EB-2250U)',
                'description': '5000 lumen professional projector',
                'category': 'Visual',
                'status': 'available',
                'condition': 'excellent',
                'quantity_total': 2,
            },
            {
                'equipment_id': 'VID-002',
                'equipment_name': 'Projector Screen (120 inch)',
                'description': 'Motorized projection screen 16:10 aspect',
                'category': 'Visual',
                'status': 'available',
                'condition': 'excellent',
                'quantity_total': 3,
            },
            {
                'equipment_id': 'VID-003',
                'equipment_name': 'Video Camera (Canon EOS R5)',
                'description': '4K cinema camera with RF lens mount',
                'category': 'Visual',
                'status': 'available',
                'condition': 'excellent',
                'quantity_total': 1,
            },
            {
                'equipment_id': 'LIG-001',
                'equipment_name': 'LED Panel (Godox SL-60W)',
                'description': '60W LED lighting system',
                'category': 'Lighting',
                'status': 'available',
                'condition': 'excellent',
                'quantity_total': 6,
            },
            {
                'equipment_id': 'LIG-002',
                'equipment_name': 'Stage Light (Par 64)',
                'description': 'Traditional par can lighting fixture',
                'category': 'Lighting',
                'status': 'available',
                'condition': 'good',
                'quantity_total': 12,
            },
            {
                'equipment_id': 'LIG-003',
                'equipment_name': 'Light Stand (Heavy Duty)',
                'description': 'Aluminum light stand with tripod base',
                'category': 'Lighting',
                'status': 'available',
                'condition': 'good',
                'quantity_total': 10,
            },
            {
                'equipment_id': 'ACC-001',
                'equipment_name': 'Microphone Stand',
                'description': 'Adjustable boom microphone stand with boom arm',
                'category': 'Accessories',
                'status': 'available',
                'condition': 'excellent',
                'quantity_total': 5,
            },
            {
                'equipment_id': 'ACC-002',
                'equipment_name': 'XLR Cable (20ft)',
                'description': 'Balanced XLR audio cable',
                'category': 'Accessories',
                'status': 'available',
                'condition': 'excellent',
                'quantity_total': 15,
            },
            {
                'equipment_id': 'ACC-003',
                'equipment_name': 'HDMI Cable (15ft)',
                'description': 'High-speed HDMI 2.0 cable',
                'category': 'Accessories',
                'status': 'available',
                'condition': 'excellent',
                'quantity_total': 10,
            },
        ]

        created_count = 0
        for eq_data in equipment_list:
            equipment, created = Equipment.objects.get_or_create(
                equipment_id=eq_data['equipment_id'],
                defaults=eq_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Created: {equipment.equipment_id} - {equipment.equipment_name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'⚠️  Already exists: {equipment.equipment_id} - {equipment.equipment_name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'\n✅ Total equipment created: {created_count}')
        )
